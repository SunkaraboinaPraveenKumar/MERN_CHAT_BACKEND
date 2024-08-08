import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { configureGemini } from '../config/openai-config.js';
import { GenerateContentResult, GenerateContentCandidate } from '@google/generative-ai';

// Function to generate chat completion
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract the message from the request body
  const { message } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(res.locals.jwtData.id);

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    // Create the chat history
    const chatHistory = user.chats.map(({ role, content }) => `${role}: ${content}`).join('\n');

    // Create the prompt
    const prompt = `${chatHistory}\nUser: ${message}`;

    // Configure the Gemini model
    const gemini = configureGemini();
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    // Generate the content
    const response: GenerateContentResult = await model.generateContent(prompt);

    // Log the API response
    console.log("API Response:", JSON.stringify(response, null, 2));

    // Initialize the assistant response
    let assistantResponse = "No response";

    // Check if there are any candidates
    if (response?.response?.candidates?.length > 0) {
      // Get the first candidate
      const candidate: GenerateContentCandidate = response.response.candidates[0];

      // Check if the candidate has content
      if (candidate.content && Array.isArray(candidate.content.parts)) {
        // Format the response parts
        assistantResponse = candidate.content.parts.map(part => {
          // Handle code snippets
          if (part.text.startsWith("java")) {
            return `\`\`\`java\n${part.text}\n\`\`\``;
          }

          // Return the text
          return part.text;
        }).join('');
      } else {
        console.warn("Unexpected content structure:", candidate.content);
      }
    } else {
      console.warn("No valid candidates found in response.");
    }
    user.chats.push({ role: "user", content: message });
    // Add the assistant response to the chat history
    user.chats.push({ role: "assistant", content: assistantResponse });

    // Save the user
    await user.save();

    // Return the assistant response
    res.status(200).json({ message: assistantResponse });
  } catch (error) {
    // Log the error
    console.error("Error generating chat completion:", error);

    // Return an internal server error
    res.status(500).json({ message: "Internal server error", cause: error.message });
  }
};

// Function to retrieve chats for the user
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the user by ID
    const user = await User.findById(res.locals.jwtData.id);

    // Check if the user exists
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    // Check if the user ID matches the JWT data ID
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Return the chats
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    // Log the error
    console.log(error);

    // Return an internal server error
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

// Function to delete chats for the user
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the user by ID
    const user = await User.findById(res.locals.jwtData.id);

    // Check if the user exists
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    // Check if the user ID matches the JWT data ID
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Delete the chats
    //@ts-ignore
    user.chats = [];

    // Save the user
    await user.save();

    // Return a success message
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    // Log the error
    console.log(error);

    // Return an internal server error
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};