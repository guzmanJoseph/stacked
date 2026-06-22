import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Extract the bet slip information from this screenshot.

Return ONLY valid JSON:
{
  "book": string | null,
  "desc": string | null,
  "stake": number | null,
  "odds": string | null,
  "sport": string | null,
  "result": "pending",
  "date": string | null,
  "cashout_amount": null,
  "cashed_out": false,
  "legs": [
    {
      "selection": string | null,
      "odds": string | null
    }
  ]
}
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

    const text = response.output_text;
    const parsed = JSON.parse(text);

    res.status(200).json(parsed);
  } catch (err) {
    console.error("SCAN ERROR:", err);
    res.status(500).json({ error: "Failed to scan bet screenshot" });
  }
}