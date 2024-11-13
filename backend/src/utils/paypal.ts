import crypto from "crypto";
import crc32 from "buffer-crc32";
import fs from "fs/promises";
import { CACHE_DIR, WEBHOOK_ID } from "../constants";


async function downloadAndCache(url?: any, cacheKey?: any) {
    if(!cacheKey) {
      cacheKey = url.replace(/\W+/g, '-')
    }
    const filePath = `${CACHE_DIR}/${cacheKey}`;
   
    // Check if cached file exists
    const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (cachedData) {
      return cachedData;
    }
   
    // Download the file if not cached
    const response = await fetch(url);
    const data = await response.text()
    await fs.writeFile(filePath, data);
   
    return data;
  }


export async function verifySignature(event: any, headers: any) {
    const transmissionId = headers['paypal-transmission-id']
    const timeStamp = headers['paypal-transmission-time']
    const crc = parseInt("0x" + crc32(JSON.stringify(event)).toString('hex')); // hex crc32 of raw event data, parsed to decimal form
   
    const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`
    console.log(`Original signed message ${message}`);
   
    const certPem = await downloadAndCache(headers['paypal-cert-url']);
   
    // Create buffer from base64-encoded signature
    const signatureBuffer = Buffer.from(headers['paypal-transmission-sig'], 'base64');
   
    // Create a verification object
    const verifier = crypto.createVerify('SHA256');
   
    // Add the original message to the verifier
    verifier.update(message);
   
    return verifier.verify(certPem, signatureBuffer);
  }
