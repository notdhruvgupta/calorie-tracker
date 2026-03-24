const API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error('API key not set — add VITE_ANTHROPIC_API_KEY to .env');
  return key;
}

function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  return JSON.parse(text);
}

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. When given food items (by name, description, or image), estimate the calorie and macronutrient breakdown.

ALWAYS respond with valid JSON in this exact format:
{
  "dishName": "Name of the dish",
  "items": [
    {
      "name": "Ingredient name",
      "qty": 100,
      "unit": "g",
      "calories": 150,
      "protein": 10,
      "carbs": 20,
      "fat": 5
    }
  ]
}

Rules:
- Be as accurate as possible with calorie and macro estimates
- Break dishes down into individual ingredients when possible
- Use grams as the default unit unless another unit is more natural (e.g., "1 piece", "1 cup")
- Round all numbers to integers
- Return ONLY the JSON object, no other text`;

export async function analyzeText(dishName, ingredients) {
  let prompt = `Analyze this food: "${dishName}"`;
  if (ingredients && ingredients.trim()) {
    prompt += `\n\nSpecific ingredients provided by the user:\n${ingredients}`;
  }
  prompt += '\n\nReturn the JSON nutrition breakdown.';

  console.log(prompt);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  return extractJSON(text);
}

export async function analyzeImage(base64, mediaType) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'Identify the food in this image and return the JSON nutrition breakdown.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  return extractJSON(text);
}
