import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import _config from "../config/config.js";
import tools from "./tools.js";
import logger from "../loggers/winston.logger.js";
import { ToolMessage, AIMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.2,
    maxRetries: 5,
    apiKey: _config.GEMINI_API_KEY,
});

const graph = new StateGraph(MessagesAnnotation);

graph.addNode("tools", async (state, config) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = lastMessage.tool_calls || [];

    const toolCallResults = await Promise.all(
        toolCalls.map(async (call) => {
            const tool = tools[call?.name];

            if (!tool) {
                throw new Error(`Tool ${call.name} not found`);
            }

            const toolInput = call.args;

            logger.info(`Invoking tool: ${call.name}, with input: ${call}`);

            const toolResult = await tool.func({
                ...toolInput,
                accessToken: config?.metadata?.accessToken,
            });

            return new ToolMessage({ content: toolResult, name: call.name });
        })
    );

    state.messages.push(...toolCallResults);
    return state;
});

graph.addNode("chat", async (state) => {
    try {
        const response = await model.invoke(state.messages, {
            tools: [tools.searchProducts, tools.addProductToCart],
        });

        state.messages.push(
            new AIMessage({ content: response.text, tool_calls: response.tool_calls })
        );

        return state;
    } catch (error) {
        logger.error(`Error on chat node: ${error.message}`, {
            meta: error,
        });

        return "I apologize, but I'm unable to process your request at the moment. Please try again or contact support if the issue persists";
    }
});

graph.addEdge("__start__", "chat");

graph.addConditionalEdges("chat", async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage?.tool_calls?.length > 0) {
        return "tools";
    } else {
        return "__end__";
    }
});

graph.addEdge("tools", "chat");

const agent = graph.compile();

export default agent;
