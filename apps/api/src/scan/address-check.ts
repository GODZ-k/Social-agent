import { BlockList, isIP } from "node:net";

// Addresses the server can reach and a visitor cannot. A scan must never connect to one.
const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata (169.254.169.254)
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, broadcast
] as const) {
  blocked.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["64:ff9b::", 96], // NAT64: can point at a private IPv4 address
  ["2001:db8::", 32], // documentation
  ["2001::", 32], // Teredo: obfuscates an embedded IPv4 address (distinct from 2001:db8::/32 above)
  ["2002::", 16], // 6to4: embeds an IPv4 address in bits 16-47
  ["fc00::", 7], // unique-local
  ["fe80::", 10], // link-local
  ["ff00::", 8], // multicast
] as const) {
  blocked.addSubnet(network, prefix, "ipv6");
}

/** True when the IP address is private, internal or reserved. Anything that is not an IP is blocked. */
export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return true;
  if (family === 4) return blocked.check(address, "ipv4");

  // "::ffff:127.0.0.1" is the IPv4 address 127.0.0.1 written as IPv6.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return blocked.check(mapped[1]!, "ipv4");
  if (/^::ffff:/i.test(address)) return true; // the hex form of a mapped address: refuse rather than decode
  return blocked.check(address, "ipv6");
}
