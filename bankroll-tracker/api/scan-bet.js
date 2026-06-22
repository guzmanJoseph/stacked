import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      text: {
        format: { type: "json_object" },
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Extract the bet slip information from this screenshot.

Return only valid JSON in this exact shape:
{
  "book": null,
  "desc": null,
  "stake": null,
  "odds": null,
  "sport": null,
  "result": "pending",
  "date": null,
  "cashout_amount": null,
  "cashed_out": false,
  "legs": []
}

Use numbers for stake. Use strings for odds like "+319" or "-110".
If a field is missing, use null.
              `,
            },
            {
              type: "input_image",
              image_url: imageBase64,
            },
          ],
        },
      ],
    });

    const parsed = JSON.parse(response.output_text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("SCAN ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to scan bet screenshot",
    });
  }
}