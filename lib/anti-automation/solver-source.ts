/**
 * Source code of the proof-of-work solver, as a string: it runs inside a Web Worker created from a Blob (the CSP allows
 * `worker-src blob:`), and the very same text is evaluated by the unit tests and compared with `node:crypto`.
 * Plain ES5-style JavaScript on purpose: no imports, no template literals, nothing a bundler could rewrite.
 *
 * `solve(token, difficulty, start, limit)` tries the counters start .. start+limit-1 and returns the first one such that
 * SHA-256(token + ":" + counter) has at least `difficulty` leading zero bits, or -1 when none of them does.
 */
export const SOLVER_SOURCE = `
var K = new Uint32Array([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
]);
var W = new Uint32Array(64);

function sha256(msg, len, out) {
  var padded = ((len + 9 + 63) >> 6) << 6;
  var i;
  for (i = len; i < padded; i++) msg[i] = 0;
  msg[len] = 0x80;
  var bitsHi = Math.floor(len / 0x20000000);
  var bitsLo = (len << 3) >>> 0;
  msg[padded - 8] = (bitsHi >>> 24) & 255;
  msg[padded - 7] = (bitsHi >>> 16) & 255;
  msg[padded - 6] = (bitsHi >>> 8) & 255;
  msg[padded - 5] = bitsHi & 255;
  msg[padded - 4] = (bitsLo >>> 24) & 255;
  msg[padded - 3] = (bitsLo >>> 16) & 255;
  msg[padded - 2] = (bitsLo >>> 8) & 255;
  msg[padded - 1] = bitsLo & 255;

  var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (var off = 0; off < padded; off += 64) {
    var t, j;
    for (t = 0; t < 16; t++) {
      j = off + t * 4;
      W[t] = (msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3];
    }
    for (t = 16; t < 64; t++) {
      var x = W[t - 15], y = W[t - 2];
      var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (t = 0; t < 64; t++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + K[t] + W[t]) | 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  out[0] = h0 >>> 0; out[1] = h1 >>> 0; out[2] = h2 >>> 0; out[3] = h3 >>> 0;
  out[4] = h4 >>> 0; out[5] = h5 >>> 0; out[6] = h6 >>> 0; out[7] = h7 >>> 0;
}

function utf8(text) {
  var bytes = [];
  for (var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    if (code < 128) bytes.push(code);
    else if (code < 2048) bytes.push(192 | (code >> 6), 128 | (code & 63));
    else bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63));
  }
  return bytes;
}

function leadingZeroBits(out) {
  if (out[0] !== 0) return Math.clz32(out[0]);
  return 32 + Math.clz32(out[1]);
}

function solve(token, difficulty, start, limit) {
  var prefix = utf8(token + ":");
  var msg = new Uint8Array(prefix.length + 16 + 80);
  var out = new Uint32Array(8);
  var i;
  for (i = 0; i < prefix.length; i++) msg[i] = prefix[i];
  for (var counter = start; counter < start + limit; counter++) {
    var digits = String(counter);
    var len = prefix.length;
    for (i = 0; i < digits.length; i++) msg[len++] = digits.charCodeAt(i);
    sha256(msg, len, out);
    if (leadingZeroBits(out) >= difficulty) return counter;
  }
  return -1;
}
`;

/** What the Worker runs: solves in batches so that a cancelled run (terminate) stops quickly, then reports. */
export const WORKER_SOURCE = `${SOLVER_SOURCE}
self.onmessage = function (event) {
  var data = event.data;
  var start = 0;
  var batch = 50000;
  for (;;) {
    var found = solve(data.token, data.difficulty, start, batch);
    if (found !== -1) {
      self.postMessage({ counter: String(found) });
      return;
    }
    start += batch;
  }
};
`;
