import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // First, upload and process the receipt
    const veryfiFormData = new FormData()
    veryfiFormData.append("file", file)
    veryfiFormData.append("auto_delete", "false")

    console.log("Sending request to Veryfi API...")
    console.log("Client ID:", process.env.VERYFI_CLIENT_ID)
    console.log("API Key:", process.env.VERYFI_API_KEY ? "Present" : "Missing")

    // Remove Content-Type header to let the browser set it with the correct boundary
    const headers = {
      "CLIENT-ID": process.env.VERYFI_CLIENT_ID || "",
      "AUTHORIZATION": `apikey ${process.env.VERYFI_API_KEY || ""}`,
    }
    console.log("Request headers:", headers)

    const processResponse = await fetch("https://api.veryfi.com/api/v8/partner/documents/", {
      method: "POST",
      headers,
      body: veryfiFormData,
    })

    if (!processResponse.ok) {
      const errorText = await processResponse.text()
      console.error("Veryfi API error:", errorText)
      console.error("Response status:", processResponse.status)
      console.error("Response headers:", Object.fromEntries(processResponse.headers.entries()))
      throw new Error(`Failed to process receipt: ${errorText}`)
    }

    const processData = await processResponse.json()
    console.log("Process data:", processData)
    const documentId = processData.id

    // Then, retrieve the processed document
    const getResponse = await fetch(`https://api.veryfi.com/api/v8/partner/documents/${documentId}/`, {
      headers,
    })

    if (!getResponse.ok) {
      const errorText = await getResponse.text()
      console.error("Veryfi API error:", errorText)
      throw new Error(`Failed to retrieve receipt data: ${errorText}`)
    }

    const receiptData = await getResponse.json()
    console.log("Receipt data:", receiptData)

    // Transform the line items into the format expected by the app
    const transformedItems = receiptData.line_items
      .filter((item: any) => item && item.description && item.total !== undefined && item.total !== null)
      .map((item: any, index: number) => ({
        id: String(index + 1),
        name: item.description || "Unnamed Item",
        amount: Number(item.total) || 0,
        assignedTo: [],
      }))

    if (transformedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid line items found in the receipt" },
        { status: 400 }
      )
    }

    return NextResponse.json({ items: transformedItems })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process receipt" },
      { status: 500 }
    )
  }
} 