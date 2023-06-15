
import { DynamicTool } from "langchain/tools";

import lnService from 'ln-service'

const { lnd } = lnService.authenticatedLndGrpc({
    macaroon: process.env.MACAROON,
    socket: process.env.LND_SOCKET,
});

// Helper function to create a Bitcoin Lightning invoice
const createInvoice = async (input: string): Promise<string> => {
    console.log(`Creating invoice for ${ input } satoshis...`);
    try {

        const parsedInput = parseInt(input);

        const invoice = await lnService.createInvoice({ lnd, "mtokens": parsedInput * 1000 });
        console.log({ invoice });
        return invoice.request;
    } catch (error: any) {
        return `Error: ${ error.message }`;
    }
};

// Helper function to get the Bitcoin Lightning invoice status

const checkInvoice = async (input: string): Promise<string> => {
    console.log(`Checking invoice ${ input }...`);
    try {
        const decodedInvoice = await lnService.decodePaymentRequest({ lnd, request: input });
        const result = await lnService.getInvoice({ lnd, id: decodedInvoice.id });
        console.log({ result });
        return result.is_confirmed ? "paid" : "unpaid";
    } catch (error: any) {
        return `Error: ${ error.message }`;
    }
};

// Helper function to pay a Bitcoin Lightning invoice

const payInvoice = async (input: string): Promise<string> => {
    console.log(`Paying invoice ${ input }...`);
    try {
        const result = await lnService.pay({ lnd, request: input });
        console.log({ result });
        return result.is_confirmed ? "paid" : "unpaid";
    } catch (error: any) {
        return `Error: ${ error.message }`;
    }
};


// Define the tools
const createInvoiceTool = new DynamicTool({
    name: "createBitcoinLightningInvoice",
    description: `Returns a real Bitcoin Lightning invoice request string.
     Input should be a single numerical value representing the number of satoshis to be paid.`,
    func: createInvoice,
});

const checkInvoiceTool = new DynamicTool({
    name: "checkBitcoinLightningInvoice",
    description: `Returns the status of a real Bitcoin Lightning invoice.
        Input should be a single string representing the invoice request.`,
    func: checkInvoice,
});

const payInvoiceTool = new DynamicTool({
    name: "payBitcoinLightningInvoice",
    description: `Pays a real Bitcoin Lightning invoice.
        Input should be a single string representing the invoice request.`,
    func: payInvoice,
});

export default { createInvoiceTool, checkInvoiceTool, payInvoiceTool };