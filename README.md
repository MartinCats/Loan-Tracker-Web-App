# Loan Tracker Web

## LAN preview

To test from a phone on the same Wi-Fi network, start Next bound to all network interfaces:

```bash
npm run dev:lan
```

Then open:

```text
http://YOUR_LAN_IP:3000
```

The Next dev config allows common private LAN hosts such as `192.168.*.*`, `10.*.*.*`, and `172.*.*.*`. If your dev host is different, add comma-separated host patterns to `NEXT_ALLOWED_DEV_ORIGINS`.
