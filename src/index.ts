import 'dotenv/config';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import LndTools from "./LndTools";

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


async function run() {


    // Initialize the model with desired parameters
    const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-0613",
        temperature: 0.4,
        verbose: false,
        timeout: 5 * 60 * 1000
    });

    // Add all available tools to the array
    const tools = [
        LndTools.createInvoiceTool, 
        LndTools.checkInvoiceTool, 
        LndTools.payInvoiceTool
    ];

    // Initialize the executor with the tools and model
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "openai-functions",
        maxIterations: 6,
        verbose: false,
    });

    let lastConsoleCommand = "Let's start! What can you do?"

    while (lastConsoleCommand !== "exit") {

        console.log(`Executing agent with input "${ lastConsoleCommand }"...`);

        // Call the executor with the input message
        const result = await executor.call({ input: lastConsoleCommand });


        console.log(`\x1b[33mAgent: ${ result.output }  \x1b[0m`);

        // get console input
        let consoleInput = await new Promise((resolve, reject) => {
            readline.question('Enter your input: ', (answer: string) => {
                resolve(answer);
            })
        }) as string;

        lastConsoleCommand = consoleInput;

    }
}

// Run the async function
run().catch(error => console.error(error));