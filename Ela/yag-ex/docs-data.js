// Single, clean docs data file. Each body is safely inside a template literal.
// This file contains small HTML/Markdown fragments that are rendered by the docs site.
window.DOCS_SECTIONS = [

  {
    id: 'introduction',
    title: 'Introduction  Get Started',
    body: `### Introduction  Get Started

<div class="card" style="max-width:1400px;width:100%;margin-left:auto;margin-right:auto;padding:22px 24px;border-radius:18px;margin-bottom:16px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);">
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="font-size:1.25rem;font-weight:700;">Welcome to YagoutPay Docs</div>
    <div style="color:var(--muted);font-size:0.98rem;">A concise guide to integrating the hosted checkout or direct API flows. Pick the path that suits your platform and security requirements.</div>
  </div>
</div>

<pre data-lang="js"><button class="copy" data-code="const%20form%20%3D%20document.createElement('form')%3B%5Cnform.method%20%3D%20'POST'%3B%5Cnform.action%20%3D%20'https%3A%2F%2Fgateway.example%2Fhosted%2Fentry'%3B%5Cnform.innerHTML%20%3D%20'%3Cinput%20name%3D%22amount%22%20value%3D%22500%22%2F%3E%5Cn%3Cinput%20name%3D%22order_id%22%20value%3D%22ORDER-123%22%2F%3E'%3B%5Cndocument.body.appendChild(form)%3B%5Cnform.submit()%3B">Copy</button><code>const form = document.createElement('form');
form.method = 'POST';
form.action = 'https://gateway.example/hosted/entry';
form.innerHTML = '<input name="amount" value="500"/>' + '\n' + '<input name="order_id" value="ORDER-123"/>';
document.body.appendChild(form);
form.submit();</code></pre>

The code above demonstrates the basic browser-hosted approach: collect amount and order id, POST to the gateway's hosted entry, then handle the callback on return.
`
  },

  {
    id: 'getting started',
    title: 'Stage 1  Hosted Browser Flow',
    body: `### Stage 1 — Hosted Browser Flow

This integration keeps card collection on the gateway and only sends three fields from the browser: <code>me_id</code>, <code>merchant_request</code>, and <code>hash</code>. Your server prepares the encrypted values; the browser simply posts them to the gateway.

In plain steps:
- Your server builds the merchant payload (JSON) using the repository builders.
- Encrypt that payload with AES-256-CBC and Base64-encode the ciphertext => <code>merchant_request</code>.
- Build a checksum string (ME_ID~orderNo~amountNormalized~country~currency). Compute the lowercase SHA256 hex of that string, then encrypt the hex (AES-256-CBC + Base64) => <code>hash</code>.
- Return an HTML form (or auto-post page) with the three fields. The browser posts to the gateway's hosted URL.

Quick checklist (common causes of failure):
- IV must be exactly <code>0123456789abcdef</code>.
- Merchant key is given as Base64; decode to 32 bytes for AES-256.
- Normalize amounts by stripping trailing zeros and a trailing dot (e.g. <code>1.00 -> 1</code>, <code>123.50 -> 123.5</code>).
- Use a browser form POST (application/x-www-form-urlencoded), not JSON, for the hosted flow.

Minimal, clear Node (Express) example using the repo helpers:

<pre data-lang="js"><button class="copy" data-code="const%20express%20%3D%20require('express')%3B%0Aconst%20app%20%3D%20express()%3B%0Aapp.use(express.json())%3B%0Aconst%20%7B%20buildMerchantPlainString%20%7D%20%3D%20require('./src/yagout/buildRequest')%3B%0Aconst%20%7B%20encryptAes256CbcBase64%2C%20generateSha256Hex%20%7D%20%3D%20require('./src/yagout/crypto')%3B%0Afunction%20normalizeAmount(a)%20%7B%20const%20s%20%3D%20String(a)%3B%20return%20s.replace(/(\.\d*?)0+$/,'%241').replace(/\.$/%27'%2C'%27')%3B%20%7D%0Aapp.post('/create-hosted',%20(req,%20res)%20%3D%3E%20%7B%0A%20%20const%20plain%20%3D%20buildMerchantPlainString(%7B%20meId%3A%20process.env.ME_ID%2C%20orderNo%3A%20req.body.order_id%2C%20amount%3A%20req.body.amount%20%7D)%3B%0A%20%20const%20merchant_request%20%3D%20encryptAes256CbcBase64(plain%2C%20process.env.MERCHANT_KEY_BASE64)%3B%0A%20%20const%20amountNorm%20%3D%20normalizeAmount(req.body.amount)%3B%0A%20%20const%20checksumInput%20%3D%20process.env.ME_ID%20+%20'~'%20+%20req.body.order_id%20+%20'~'%20+%20amountNorm%20+%20'~'%20+%20'ETH'%20+%20'~'%20+%20'ETB'%3B%0A%20%20const%20shaHex%20%3D%20generateSha256Hex(checksumInput)%3B%0A%20%20const%20hash%20%3D%20encryptAes256CbcBase64(shaHex%2C%20process.env.MERCHANT_KEY_BASE64)%3B%0A%20%20const%20host%20%3D%20process.env.PAYMENT_HOST%20%7C%7C%20'https%3A%2F%2Fpay.example'%3B%0A%20%20res.send('%3C!doctype%20html%3E%3Chtml%3E%3Cbody%3E%3Cform%20id%3D%22f%22%20method%3D%22POST%22%20action%3D%22'%20+%20host%20+%20'%2Fpay%22%3E'%20+%20'%3Cinput%20name%3D%22me_id%22%20value%3D%22'%20+%20process.env.ME_ID%20+%20'%22%2F%3E'%20+%20'%3Cinput%20name%3D%22merchant_request%22%20value%3D%22'%20+%20merchant_request%20+%20'%22%2F%3E'%20+%20'%3Cinput%20name%3D%22hash%22%20value%3D%22'%20+%20hash%20+%20'%22%2F%3E'%20+%20'%3C%2Fform%3E%3Cscript%3Edocument.getElementById(%22f%22).submit()%3C%2Fscript%3E%3C%2Fbody%3E%3C%2Fhtml%3E')%3B%0A%7D)%3B%0Aapp.listen(3000)%3B">Copy</button><code>// Express example: server builds the encrypted payloads and returns an auto-post form
const express = require('express');
const app = express();
app.use(express.json());

const { buildMerchantPlainString } = require('./src/yagout/buildRequest');
const { encryptAes256CbcBase64, generateSha256Hex } = require('./src/yagout/crypto');
function normalizeAmount(a) { const s = String(a); return s.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,''); }

app.post('/create-hosted', (req, res) => {
  const plain = buildMerchantPlainString({ meId: process.env.ME_ID, orderNo: req.body.order_id, amount: req.body.amount });
  const merchant_request = encryptAes256CbcBase64(plain, process.env.MERCHANT_KEY_BASE64);
  const amountNorm = normalizeAmount(req.body.amount);
  const checksumInput = process.env.ME_ID + '~' + req.body.order_id + '~' + amountNorm + '~' + 'ETH' + '~' + 'ETB';
  const shaHex = generateSha256Hex(checksumInput);
  const hash = encryptAes256CbcBase64(shaHex, process.env.MERCHANT_KEY_BASE64);
  const host = process.env.PAYMENT_HOST || 'https://pay.example';
  res.send('<!doctype html><html><body><form id="f" method="POST" action="' + host + '/pay">'
    + '<input name="me_id" value="' + process.env.ME_ID + '"/>'
    + '<input name="merchant_request" value="' + merchant_request + '"/>'
    + '<input name="hash" value="' + hash + '"/>'
    + '</form><script>document.getElementById("f").submit()</script></body></html>');
});

app.listen(3000);
</code></pre>

If you want to inspect or debug the exact form values, return the form HTML without auto-submit or log the three fields on the server — this is the fastest way to diagnose checksum or encryption mismatches.
`
  },

  {
    id: 'hosted-browser-flow',
    title: 'Hosted Browser Flow exact protocol and troubleshooting',
    body: `
### Hosted Browser Flow exact protocol

<div class="card" style="max-width:1400px;width:100%;margin-left:auto;margin-right:auto;padding:18px 20px;border-radius:12px;margin-bottom:14px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);">
  <div style="font-weight:700;font-size:1.02rem;margin-bottom:10px;">Summary what the gateway expects</div>
  <ul style="margin:0 0 12px 18px;line-height:1.5;">
    <li>POST (browser auto-form) to the gateway hosted entry point with three form fields (application/x-www-form-urlencoded):</li>
    <li style="margin-top:6px;"><code>me_id</code> — plain merchant/ME id (header-style identifier; plain text)</li>
    <li style="margin-top:6px;"><code>merchant_request</code> — AES-256-CBC Base64 ciphertext of the merchant plain string</li>
    <li style="margin-top:6px;"><code>hash</code> — AES-256-CBC Base64 ciphertext of the lowercase SHA256 hex of the checksum input</li>
  </ul>

  <div style="font-weight:700;margin-top:6px;margin-bottom:8px;">Checksum & encryption step by step</div>
  <ol style="margin-left:18px;line-height:1.45;">
    <li>
      Build the merchant plain string exactly as the repo builder does (see <code>src/yagout/buildRequest.js</code> / <code>buildMerchantPlainString</code>). This exact plain string is what the gateway expects.
    </li>

    <li style="margin-top:8px;">
      Encrypt the merchant plain string using AES-256-CBC and Base64-encode the ciphertext.<br/>
      Demo helper: <code>encryptAes256CbcBase64(plainString, MERCHANT_KEY_BASE64)</code>
    </li>

    <li style="margin-top:8px;">
      Compute the checksum input string using this exact literal format:
      <div style="margin-top:6px;background:#0f1720;color:#e6eef6;padding:10px;border-radius:6px;display:inline-block;font-family:monospace;">
        <code>\${{ME_ID}}~\${{orderNo}}~\${{amountNormalized}}~\${{country}}~\${{currency}}</code>
      </div>
      <div style="color:var(--muted);margin-top:8px;">
        - <code>amountNormalized</code> must strip trailing zeros and a trailing decimal point (examples: <code>1.00 → 1</code>, <code>123.50 → 123.5</code>).<br/>
        - <code>country</code> and <code>currency</code> are the codes used in the merchant payload (the C# demo used <code>ETH</code> and <code>ETB</code>).
      </div>
    </li>

    <li style="margin-top:8px;">
      Compute the SHA256 hex digest of the checksum input string. Use lowercase hex digits and no prefix.
      Demo helper: <code>generateSha256Hex(checksumInput)</code>
    </li>

    <li style="margin-top:8px;">
      Encrypt the SHA256 hex string with the same AES-256-CBC merchant key and Base64-encode the ciphertext. Post that value in the <code>hash</code> form field.
    </li>

    <li style="margin-top:8px;">
      POST an auto-submitting form (or POST programmatically) with the three fields: <code>me_id</code>, <code>merchant_request</code>, <code>hash</code>.
    </li>
  </ol>

  <div style="margin-top:12px;">
    <strong>Important constants & notes</strong>
    <ul style="margin:6px 0 0 18px;color:var(--muted);line-height:1.4;">
      <li><code>IV</code>: fixed value <code>0123456789abcdef</code> (C# and Node helpers match this). Both sides must use the same IV and encoding.</li>
      <li><code>Merchant key</code>: provided as Base64; decoded bytes must be 32 bytes for AES-256.</li>
      <li><code>SHA256 hex</code>: lowercase hex, no <code>0x</code> prefix.</li>
      <li>The hosted browser flow posts raw form fields (not wrapped JSON). Make sure content-type matches the POST method (form vs JSON API).</li>
    </ul>
  </div>

    <div style="margin-top:12px;">
    <strong>Node snippet (use repo helpers)</strong>
    <pre data-lang="js" style="margin-top:8px;background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;position:relative;">
      <button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button>
<code>// Use repo helpers from this repo
const { buildMerchantPlainString } = require('./src/yagout/buildRequest');
const { encryptAes256CbcBase64, generateSha256Hex } = require('./src/yagout/crypto');
function normalizeAmount(a) { const s = String(a); return s.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,''); }

const plain = buildMerchantPlainString({ meId: process.env.ME_ID, orderNo: 'ORDER-123', amount: 1.00 /* ...other fields... */ });
const merchant_request = encryptAes256CbcBase64(plain, process.env.MERCHANT_KEY_BASE64);
const amountNorm = normalizeAmount(1.00);
const checksumInput = '\u0024{process.env.ME_ID}~ORDER-123~\u0024{amountNorm}~ETH~ETB';
const shaHex = generateSha256Hex(checksumInput);
const hash = encryptAes256CbcBase64(shaHex, process.env.MERCHANT_KEY_BASE64);
console.log({ me_id: process.env.ME_ID, merchant_request, hash });</code></pre>
  </div>

  <div style="margin-top:12px;">
    <strong>Troubleshooting checklist</strong>
    <ul style="margin:8px 0 0 18px;line-height:1.4;">
      <li><strong>Merchant ID missing</strong>: ensure the POST contains <code>me_id</code> and that you are sending a form POST (not JSON) for the hosted flow.</li>
      <li><strong>Invalid encryption</strong>: verify the merchant key Base64 decodes to 32 bytes, the IV is <code>0123456789abcdef</code>, and that both <code>merchant_request</code> and <code>hash</code> are AES-256-CBC Base64 ciphertexts of the exact inputs (plain string and SHA256 hex respectively).</li>
      <li><strong>Checksum mismatch</strong>: incorrect amount normalization is a frequent cause. Strip trailing zeros and a trailing decimal point (<code>1.00 → 1</code>).</li>
      <li>If the gateway rejects the request, open the auto-post page, inspect the form inputs (you can temporarily disable auto-submit in <code>src/views/autoPost.ejs</code>) and copy the raw form data and Base64 ciphertexts for UAT support.</li>
    </ul>
  </div>

  <div style="margin-top:12px;color:var(--muted);font-size:13px;"></div>
</div>
`
  },

  {
    id: 'direct-api-implementations',
    title: 'Direct API Implementations Stage 2',
    body: `
Stage 2 focuses on server-to-server Direct API requests and Payment Links. The steps are identical across languages:

- Build the plain JSON merchant payload using the repo builders (see language folders listed below).
- Encrypt the serialized JSON with AES-256-CBC using your Base64 merchant key. IV = "0123456789abcdef".
- POST the encrypted ciphertext inside a wrapper JSON: { "request": "<cipher>" } and include header <code>me_id</code> with your ME_ID.

Below are concise, copyable examples (Swift, Django/Python, C#, Java). Each snippet follows the same logical steps: build plain, encrypt, compute checksum input, SHA256 hex, encrypt the hex as the <code>hash</code>, then POST the wrapper.

<div style="max-width:1400px;width:100%;margin-left:auto;margin-right:auto;margin-top:10px;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:8px;background:linear-gradient(180deg,rgba(255,255,255,0.01),transparent);">
  <strong style="display:block;margin-bottom:6px;">Repository contexts (where to look)</strong>
  <ul style="margin:0 0 0 18px;color:var(--muted);line-height:1.45;">
    <li><strong>Swift</strong> — <code>swift-basic</code> (Sources: <code>CryptoUtil.swift</code>, <code>RequestBuilder.swift</code>)</li>
    <li><strong>Django / Python</strong> — <code>yagot-django/payments</code> (<code>crypto_util.py</code>, <code>request_builders.py</code>)</li>
    <li><strong>C#</strong> — <code>yagout-csharp/YagoutPay.Demo/Services</code> (<code>CryptoUtil.cs</code>, <code>RequestBuilders.cs</code>)</li>
    <li><strong>Java</strong> — <code>yagout-java/yagout-java-sdk/src/main/java/com/yagout/sdk/crypto/CryptoUtil.java</code></li>
  </ul>
</div>


<div style="margin-top:12px;">
  <strong>Swift (swift-basic)</strong>
  <div style="color:var(--muted);margin:6px 0 8px 0;font-size:13px;">Key files: <code>Sources/CryptoUtil.swift</code>, <code>Sources/RequestBuilder.swift</code></div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code>// build plain JSON string (use your RequestBuilder)
let plain = "{ \"orderNo\": \"ORDER-123\", \"amount\": 1.00 }" // replace with builder
let merchantRequest = try CryptoUtil.encryptBase64(plain, keyBase64: MERCHANT_KEY_BASE64)
let amountNorm = "1" // normalize as needed
let checksumInput = "\(ME_ID)~ORDER-123~\(amountNorm)~ETH~ETB"
let shaHex = CryptoUtil.sha256Hex(checksumInput)
let hash = try CryptoUtil.encryptBase64(shaHex, keyBase64: MERCHANT_KEY_BASE64)
// POST JSON wrapper { "request": "<merchantRequest>" } with header me_id: ME_ID</code></pre>
  </div>
</div>

  <div style="margin-top:8px;color:var(--muted);font-size:13px;">Quick test (curl):</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code>curl -X POST https://gateway.example/api/payments \
  -H "me_id: YOUR_ME_ID" \
  -H "Content-Type: application/json" \
  -d '{"request":"<merchantRequest>"}'</code></pre>
  </div>

<div style="margin-top:12px;">
  <strong>Django / Python (yagot-django)</strong>
  <div style="color:var(--muted);margin:6px 0 8px 0;font-size:13px;">Key files: <code>payments/crypto_util.py</code>, <code>payments/request_builders.py</code></div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code># build plain JSON with your builder
plain = build_merchant_plain(me_id=ME_ID, order_no='ORDER-123', amount=1.00)
merchant_request = encrypt_base64(plain, MERCHANT_KEY_BASE64)
amount_norm = '1'  # normalize
checksum_input = f"{ME_ID}~ORDER-123~{amount_norm}~ETH~ETB"
sha_hex = sha256_hex(checksum_input)
hash = encrypt_base64(sha_hex, MERCHANT_KEY_BASE64)
# POST using requests
import requests
resp = requests.post('https://gateway.example/api/payments', json={'request': merchant_request}, headers={'me_id': ME_ID})
print(resp.status_code, resp.text)</code></pre>
  </div>
</div>

  <div style="margin-top:8px;color:var(--muted);font-size:13px;">Quick test (curl):</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code>curl -X POST https://gateway.example/api/payments \
  -H "me_id: YOUR_ME_ID" \
  -H "Content-Type: application/json" \
  -d '{"request":"<merchantRequest>"}'</code></pre>
  </div>

<div style="margin-top:12px;">
  <strong>C# (yagout-csharp)</strong>
  <div style="color:var(--muted);margin:6px 0 8px 0;font-size:13px;">Key files: <code>YagoutPay.Demo/Services/CryptoUtil.cs</code>, <code>RequestBuilders.cs</code></div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code>// build plain JSON (use RequestBuilders)
var plain = RequestBuilders.BuildMerchantPlain(meId, "ORDER-123", 1.00);
var merchantRequest = CryptoUtil.EncryptBase64(plain, MERCHANT_KEY_BASE64);
var amountNorm = "1"; // normalize
var checksumInput = string.Join("~", meId, "ORDER-123", amountNorm, "ETH", "ETB");
var shaHex = CryptoUtil.Sha256Hex(checksumInput);
var hash = CryptoUtil.EncryptBase64(shaHex, MERCHANT_KEY_BASE64);
// POST wrapper
using var client = new HttpClient();
client.DefaultRequestHeaders.Add("me_id", meId);
var payload = new StringContent($"{{ \"request\": \"{merchantRequest}\" }}", Encoding.UTF8, "application/json");
var resp = await client.PostAsync("https://gateway.example/api/payments", payload);
</code></pre>
  </div>
</div>

  <div style="margin-top:8px;color:var(--muted);font-size:13px;">Quick test (curl):</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var p=btn.closest('div');var c=p&&p.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code>curl -X POST https://gateway.example/api/payments \
  -H "me_id: YOUR_ME_ID" \
  -H "Content-Type: application/json" \
  -d '{"request":"<merchantRequest>"}'</code></pre>
  </div>

<div style="margin-top:12px;">
  <strong>Java (yagout-java SDK)</strong>
  <div style="color:var(--muted);margin:6px 0 8px 0;font-size:13px;">Key files: <code>yagout-java-sdk/src/main/java/com/yagout/sdk/crypto/CryptoUtil.java</code> and builders in <code>build/</code></div>
  <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>// Build plain JSON with the SDK builders
String plain = RequestBuilders.buildMerchantPlain(meId, "ORDER-123", 1.00 /* ... */);
String merchantRequest = CryptoUtil.encryptBase64(plain, MERCHANT_KEY_BASE64);
String amountNorm = "1"; // normalize
String checksumInput = String.join("~", meId, "ORDER-123", amountNorm, "ETH", "ETB");
String shaHex = CryptoUtil.sha256Hex(checksumInput);
String hash = CryptoUtil.encryptBase64(shaHex, MERCHANT_KEY_BASE64);
// POST wrapper using HttpClient or your HTTP library
</code></pre>
</div>

  <div style="margin-top:8px;color:var(--muted);font-size:13px;">Quick test (curl):</div>
  <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>curl -X POST https://gateway.example/api/payments \
  -H "me_id: YOUR_ME_ID" \
  -H "Content-Type: application/json" \
  -d '{"request":"<merchantRequest>"}'</code></pre>

<div style="margin-top:12px;color:var(--muted);font-size:13px;">Description: each snippet shows the same logical steps. Look in the folders listed above for ready builders and templates. The repo examples are runnable and provide the same AES/IV, padding, and SHA256 behavior used by the gateway — reuse the provided helpers to produce identical ciphertexts.</div>
`
  }
  ,
  {
    id: 'sdk-download',
    title: 'Download Node SDK',
    body: `### Download the pre-packaged Node SDK

<div class="sdk-card" style="max-width:1400px;width:100%;margin-left:auto;margin-right:auto;display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;padding:14px;border:1px solid rgba(15,23,42,0.06);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,0.01),transparent);">
  <div style="flex:1;min-width:260px;">
    <h4 style="margin:0 0 8px 0;">Direct ZIP download</h4>
    <p style="margin:0 0 12px;color:var(--muted);">Download the full demo + SDK bundle. This link points directly to the distributable file so you can download and inspect it immediately without following a server route.</p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
  <a href="/dist/yagoutpay-sdk-full-1.0.0.zip" download class="btn primary" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#0b79f7;color:white;text-decoration:none;font-weight:600;">Download SDK (Full ZIP)</a>
  <span style="margin-left:8px;color:var(--muted);font-size:13px;">(8.6 KB — 09/28/2025 02:35 PM)</span>
  <a href="/dist/yagoutpay-sdk-1.0.0.zip" download class="btn" style="display:inline-block;padding:10px 12px;border-radius:8px;border:1px solid #cbd5e1;background:white;color:#0b79f7;text-decoration:none;font-weight:600;margin-left:12px;">Download SDK (Minimal)</a>
  
    </div>
    <p style="margin:10px 0 0 0;color:var(--muted);font-size:13px;">If the ZIP is missing, create it locally with <code>npm run prepare-sdk</code> from the demo folder (see steps below).</p>
  </div>

  <div style="flex:1;min-width:320px;">
    <h4 style="margin:0 0 8px 0;">Install & use</h4>
    <p style="margin:0 0 8px;color:var(--muted);">Three common ways to consume the SDK depending on your workflow:</p>

    <div style="margin-bottom:8px;">
      <strong style="display:block;margin-bottom:6px;">1) Install from npm (when published)</strong>
  <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin:0;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>npm install yagoutpay-sdk</code></pre>
      <p style="margin:8px 0 0 0;color:var(--muted);font-size:13px;">Usage:</p>
  <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin:6px 0 0 0;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>const { createClient } = require('yagoutpay-sdk');
const client = createClient({ endpointUrl: 'https://your-endpoint', meId: 'ME_ID', merchantKeyBase64: process.env.MERCHANT_KEY_BASE64 });</code></pre>
    </div>

    <div style="margin-bottom:8px;">
      <strong style="display:block;margin-bottom:6px;">2) Install directly from the ZIP (local environments)</strong>
      <p style="margin:0 0 6px 0;color:var(--muted);font-size:13px;">If you downloaded the ZIP to your project root, install it with:</p>
      <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin:0;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>npm install ./dist/yagoutpay-sdk-full-1.0.0.zip
# or
npm install /path/to/yagoutpay-sdk-full-1.0.0.zip</code></pre>
    </div>

    <div>
      <strong style="display:block;margin-bottom:6px;">3) Use locally (npm pack / link)</strong>
      <p style="margin:0 0 6px 0;color:var(--muted);font-size:13px;">Build a tarball and install, or link during development:</p>
      <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin:0;position:relative;"><button class="copy" onclick="(function(btn){const p=btn.closest('pre');const c=p&&p.querySelector('code'); if(c) navigator.clipboard.writeText(c.innerText);})(this)" style="position:absolute;top:8px;right:8px;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;">Copy</button><code>npm run prepare-sdk
# then
npm pack ./dist/yagoutpay-sdk-full-1.0.0.zip
# or use npm link for local development</code></pre>
    </div>
  </div>
</div>`
  },
  {
    id: 'payment-links',
    title: 'Stage 3  Static & Dynamic Payment Links',
    body: `
### Stage 3  Static & Dynamic Payment Links

This stage covers two common patterns for distributing payment entry points.

Key ideas — the same crypto rules apply.

<div class="card" style="max-width:1400px;width:100%;margin-left:auto;margin-right:auto;padding:16px;border-radius:12px;margin-bottom:14px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);">
  <div style="font-weight:700;margin-bottom:8px;">Static link example — Node</div>
  <div style="color:var(--muted);font-size:13px;margin-bottom:8px;">Use the repo helper that builds the payment link payload (see <code>src/yagout/buildPaymentLinkPayload.js</code>).</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code style="display:block;min-width:max-content;">// build a static payment link (server side)
const { buildPaymentLinkPayload } = require('./src/yagout/buildPaymentLinkPayload');
const { encryptAes256CbcBase64, generateSha256Hex } = require('./src/yagout/crypto');
function normalizeAmount(a) { const s = String(a); return s.replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,''); }

const plain = buildPaymentLinkPayload({ meId: process.env.ME_ID, orderNo: 'ORDER-123', amount: 1.00 /* ...other fields... */ });
const merchant_request = encryptAes256CbcBase64(plain, process.env.MERCHANT_KEY_BASE64);
const amountNorm = normalizeAmount(1.00);
const checksumInput = '\u0024{process.env.ME_ID}' + '~' + 'ORDER-123' + '~' + amountNorm + '~' + 'ETH' + '~' + 'ETB';
const shaHex = generateSha256Hex(checksumInput);
const hash = encryptAes256CbcBase64(shaHex, process.env.MERCHANT_KEY_BASE64);

// Embed ciphertexts in a safe URL (encodeURIComponent the ciphertexts)
const host = process.env.PAYMENT_HOST || 'https://pay.example';
const staticUrl = host + '/pay?me_id=' + encodeURIComponent(process.env.ME_ID) + '&request=' + encodeURIComponent(merchant_request) + '&hash=' + encodeURIComponent(hash);
console.log('Static payment URL:', staticUrl);
</code></pre>
  </div>

  <div style="margin-top:10px;color:var(--muted);font-size:13px;">Quick test — open or curl the static link:</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code style="display:block;min-width:max-content;">curl -v "https://pay.example/pay?me_id=YOUR_ME_ID&request=&lt;merchantRequest&gt;&hash=&lt;hash&gt;"</code></pre>
  </div>

  <div style="font-weight:700;margin-top:12px;margin-bottom:6px;">Dynamic link example — server-created, single-use / expiring</div>
  <div style="color:var(--muted);font-size:13px;margin-bottom:8px;">Dynamic links are created on demand and can include server-side TTL, one-time tokens, or database state to prevent replay.</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code style="display:block;min-width:max-content;">// Example Express route generating a dynamic, single-use link
// in src/server.js you might add a route like:
app.post('/create-link', async (req, res) => {
  // validate input, store a single-use token in DB with TTL
  const { orderNo, amount } = req.body;
  const plain = buildPaymentLinkPayload({ meId: process.env.ME_ID, orderNo, amount /* ... */ });
  const merchant_request = encryptAes256CbcBase64(plain, process.env.MERCHANT_KEY_BASE64);
  const amountNorm = normalizeAmount(amount);
  const checksumInput = '\u0024{process.env.ME_ID}' + '~' + orderNo + '~' + amountNorm + '~' + 'ETH' + '~' + 'ETB';
  const shaHex = generateSha256Hex(checksumInput);
  const hash = encryptAes256CbcBase64(shaHex, process.env.MERCHANT_KEY_BASE64);
  // create a short token (store mapping token -> {merchant_request,hash,used:false} with TTL)
  const token = createShortToken(); // implement in your app
  await db.saveToken(token, { merchant_request, hash, expiresAt: Date.now() + 1000 * 60 * 30 });
  res.json({ url: (process.env.PAYMENT_HOST || 'https://pay.example') + '/t/' + token });
});
</code></pre>
  </div>

  <div style="margin-top:12px;color:var(--muted);line-height:1.4;">
    <strong>Expected behavior on the payment site</strong>
    <ul style="margin:6px 0 0 18px;">
      <li>The payment handler (e.g., GET /pay or GET /t/:token) decodes the query or token, decrypts the <code>merchant_request</code>, validates the <code>hash</code> by recomputing the checksum and decrypting the posted hash, and then shows the hosted checkout UI or performs a redirect to the gateway's hosted entry.</li>
      <li>For dynamic tokens the server should mark the token as used immediately after consumption to prevent replay attacks.</li>
      <li>Links should be short-lived or single-use if used in sensitive contexts.</li>
    </ul>
  </div>
  <div style="margin-top:12px;border-top:1px solid rgba(14,20,30,0.03);padding-top:12px;">
    <strong>Static link preview — demo only</strong>
    <div style="color:var(--muted);margin-top:6px;font-size:13px;">If you want to preview a generated static payment link (demo server exposes a preview endpoint), POST the payload below to:</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:8px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
  <code style="display:block;min-width:max-content;">POST /api/payment-links/static/preview</code></pre>
  </div>

    <div style="margin-top:8px;color:var(--muted);font-size:13px;">Example JSON body (exact):</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
      <code style="display:block;min-width:max-content;">{
  "amount": "750",
  "order_id": "ORDER_UAT_123",
  "mobile_no": "0912345678"
}</code></pre>
  </div>

    <div style="margin-top:8px;color:var(--muted);font-size:13px;">Quick curl test — docs-only:</div>
  <div style="position:relative;border-radius:6px;margin-bottom:6px;">
    <button type="button" class="copy" onclick="(function(btn){var container=btn.closest('div');var c=container&&container.querySelector('code'); if(!c) return; var text=(c.innerText||c.textContent||''); function fallbackCopy(t,b){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy'); b.innerText='Copied'; setTimeout(function(){b.innerText='Copy';},1200);}catch(e){b.innerText='Copy';}document.body.removeChild(ta);} if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){btn.innerText='Copied'; setTimeout(function(){btn.innerText='Copy';},1200);}).catch(function(){fallbackCopy(text,btn);} ); } else { fallbackCopy(text,btn); } })(this)" style="position:absolute;top:8px;right:8px;z-index:3;padding:6px 8px;border-radius:6px;border:none;background:#eef2ff;color:#0b79f7;cursor:pointer;" aria-label="Copy code">Copy</button>
    <pre style="background:transparent;color:inherit;padding:12px;border:1px solid rgba(14,20,30,0.04);border-radius:6px;margin-top:6px;overflow-x:auto;overflow-y:hidden;white-space:pre;word-break:normal;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding-right:92px;">
    <code style="display:block;min-width:max-content;">curl -X POST http://localhost/api/payment-links/static/preview \
  -H "Content-Type: application/json" \
  -d '{"amount":"750","order_id":"ORDER_UAT_123","mobile_no":"0912345678"}'</code></pre>
  </div>

  <div style="margin-top:12px;color:var(--muted);font-size:13px;">Security notes: do not put secrets in URLs, always treat ciphertexts as bearer tokens, consider TLS-only cookies or short-lived tokens when requiring stronger protection.</div>
  </div>
</div>
`
  },
  ];

