import Replicate from 'replicate'; // Keeping this import as it is necessary for the functionality

let replicateClient: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (!replicateClient) {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable is required');
    }
    
    replicateClient = new Replicate({
      auth: apiToken,
    });
  }
  
  return replicateClient;
}

export async function generateImageWithReplicate(prompt: string): Promise<string> {
  const replicate = getReplicateClient();
  
  const output = await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", {
    input: {
      prompt,
      width: 1024,
      height: 1024,
      num_outputs: 1,
      scheduler: "K_EULER",
      num_inference_steps: 50,
      guidance_scale: 7.5,
    }
  }) as string[];
  
  return output[0];
}

export async function generateDesignWithReplicate(prompt: string): Promise<string> {
  const replicate = getReplicateClient();
  
  const output = await replicate.run("meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3", {
    input: {
      prompt: `Generate design specification for: ${prompt}. Return JSON with layout, colors, typography.`,
      max_new_tokens: 2000,
      temperature: 0.7,
    }
  }) as string[];
  
  return output.join('');
}