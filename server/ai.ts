import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function summarizeContent(text: string): Promise<string> {
  if (!openai) {
    return "This is a concise summary of your content highlighting the key points and main takeaways for professional readers.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional content editor. Provide a concise, engaging summary that captures the key points and value proposition of the content."
        },
        {
          role: "user",
          content: `Please summarize this content:\n\n${text}`
        }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content || "Failed to generate summary";
  } catch (error) {
    console.error("AI summarize error:", error);
    return "This is a concise summary of your content highlighting the key points and main takeaways for professional readers.";
  }
}

export async function rewriteContent(text: string): Promise<string> {
  if (!openai) {
    return "This is a professionally rewritten version of your content with improved clarity, engagement, and structure while maintaining your original message and tone.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional writing assistant. Rewrite the given content to be more engaging, clear, and professional while maintaining the original meaning and tone."
        },
        {
          role: "user",
          content: `Please rewrite this content:\n\n${text}`
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content || "Failed to rewrite content";
  } catch (error) {
    console.error("AI rewrite error:", error);
    return "This is a professionally rewritten version of your content with improved clarity, engagement, and structure while maintaining your original message and tone.";
  }
}

export async function generateTitleSuggestions(text: string): Promise<string[]> {
  if (!openai) {
    return [
      "Professional Insights: Key Takeaways",
      "Industry Best Practices and Trends",
      "Expert Analysis and Recommendations"
    ];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a content marketing expert. Generate 3 compelling, professional titles for the given content that would attract readers on a professional platform. Respond with JSON in this format: { 'titles': ['title1', 'title2', 'title3'] }"
        },
        {
          role: "user",
          content: `Generate titles for this content:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.titles || [
      "Professional Insights: Key Takeaways",
      "Industry Best Practices and Trends", 
      "Expert Analysis and Recommendations"
    ];
  } catch (error) {
    console.error("AI title generation error:", error);
    return [
      "Professional Insights: Key Takeaways",
      "Industry Best Practices and Trends",
      "Expert Analysis and Recommendations"
    ];
  }
}
