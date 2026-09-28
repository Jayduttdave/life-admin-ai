import { NextRequest, NextResponse } from "next/server";
import { AnalysisResult } from "@/types/analysis";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

function unwrapN8nResponse(parsed: unknown): Record<string, unknown> {
  let item = parsed;
  if (Array.isArray(item) && item.length > 0) {
    item = item[0];
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;

    // 1. If wrapped in "output" property
    if (record.output !== undefined && record.output !== null) {
      if (typeof record.output === "string") {
        try {
          return JSON.parse(record.output);
        } catch {
          return { summary: record.output };
        }
      }
      if (typeof record.output === "object") {
        return record.output as Record<string, unknown>;
      }
    }

    // 2. If wrapped in "json" (standard n8n node structure)
    if (record.json && typeof record.json === "object" && record.json !== null) {
      const jsonRec = record.json as Record<string, unknown>;
      if (jsonRec.output !== undefined && jsonRec.output !== null) {
        if (typeof jsonRec.output === "string") {
          try {
            return JSON.parse(jsonRec.output);
          } catch {
            return { summary: jsonRec.output };
          }
        }
        if (typeof jsonRec.output === "object") {
          return jsonRec.output as Record<string, unknown>;
        }
      }
      return jsonRec;
    }

    // 3. If wrapped in "data"
    if (
      record.data &&
      typeof record.data === "object" &&
      record.data !== null &&
      !("summary" in record) &&
      !("document_type" in record)
    ) {
      const dataRec = record.data as Record<string, unknown>;
      if (dataRec.output && typeof dataRec.output === "object") {
        return dataRec.output as Record<string, unknown>;
      }
      return dataRec;
    }

    return record;
  }

  if (typeof item === "string") {
    try {
      const parsedItem = JSON.parse(item);
      return unwrapN8nResponse(parsedItem);
    } catch {
      return { summary: item };
    }
  }

  return {};
}

export async function POST(req: NextRequest) {
  try {
    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        {
          error:
            "N8N_WEBHOOK_URL is not configured. Please set N8N_WEBHOOK_URL in your environment or .env.local file.",
        },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Request content type must be multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("data0");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No document file provided in field 'data0'." },
        { status: 400 }
      );
    }

    // Prepare multipart form-data for n8n using binary field name 'data0'
    const n8nFormData = new FormData();
    n8nFormData.append("data0", file);

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: n8nFormData,
      });
    } catch (networkError: unknown) {
      const msg =
        networkError instanceof Error
          ? networkError.message
          : "Failed to reach n8n server";
      return NextResponse.json(
        {
          error:
            "Cannot connect to the n8n backend service. Please verify that your n8n workflow is active and reachable.",
          details: msg,
        },
        { status: 503 }
      );
    }

    const responseText = await n8nResponse.text();

    if (!n8nResponse.ok) {
      let parsedError: Record<string, unknown> | null = null;
      try {
        parsedError = JSON.parse(responseText);
      } catch {
        // Response is not JSON
      }

      if (n8nResponse.status === 404 && parsedError?.hint) {
        return NextResponse.json(
          {
            error:
              "The n8n test webhook is waiting for execution. In n8n, click 'Execute workflow' or 'Test step', then click Analyze Document again.",
            hint: parsedError.hint,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error:
            (parsedError?.message as string) ||
            `n8n webhook returned status ${n8nResponse.status}.`,
          details: responseText,
        },
        { status: n8nResponse.status }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "n8n returned a non-JSON response.",
          details: responseText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Unwrap response (output, json, or root)
    const unwrapped = unwrapN8nResponse(parsed);

    // Validate that we have meaningful content
    const hasAnyContent = Boolean(
      unwrapped.document_type ||
      unwrapped.summary ||
      unwrapped.next_step ||
      (Array.isArray(unwrapped.important_information) &&
        unwrapped.important_information.length > 0) ||
      (Array.isArray(unwrapped.deadlines) && unwrapped.deadlines.length > 0) ||
      (Array.isArray(unwrapped.required_actions) &&
        unwrapped.required_actions.length > 0) ||
      (Array.isArray(unwrapped.required_documents) &&
        unwrapped.required_documents.length > 0) ||
      (Array.isArray(unwrapped.warnings) && unwrapped.warnings.length > 0)
    );

    if (!hasAnyContent) {
      return NextResponse.json(
        {
          error:
            "Received response from n8n, but could not find document analysis data. Expected properties inside 'output' or root object.",
          details: parsed,
        },
        { status: 422 }
      );
    }

    const result = unwrapped as AnalysisResult;
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
