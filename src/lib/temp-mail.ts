import { supabase } from "@/integrations/supabase/client";

async function callTempMail(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("temp-mail", { body });
  if (error) throw new Error(error.message);
  return data;
}

export async function getDomains(): Promise<string[]> {
  const data = await callTempMail({ action: "domains" });
  const members = data?.["hydra:member"] || data || [];
  return members.map((d: { domain: string }) => d.domain);
}

export async function createAccount(
  address: string,
  password: string
): Promise<{ address: string; token: string; id: string }> {
  const data = await callTempMail({ action: "create", address, password });
  return { address: data.account.address, token: data.token, id: data.account.id };
}

export interface TempMessage {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

export interface TempMessageFull extends TempMessage {
  text?: string;
  html?: string[];
}

export async function getMessages(token: string): Promise<TempMessage[]> {
  const data = await callTempMail({ action: "messages", token });
  return data?.["hydra:member"] || data || [];
}

export async function readMessage(token: string, messageId: string): Promise<TempMessageFull> {
  return await callTempMail({ action: "read", token, messageId });
}

export async function deleteAccount(token: string): Promise<void> {
  await callTempMail({ action: "delete", token });
}

export function generateRandomAddress(domain: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let name = "";
  for (let i = 0; i < 10; i++) name += chars[Math.floor(Math.random() * chars.length)];
  return `${name}@${domain}`;
}
