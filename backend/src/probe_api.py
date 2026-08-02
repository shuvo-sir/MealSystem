import urllib.request
import urllib.error

url = 'https://mealsystem.onrender.com/api/meals/my-group'
headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zQ25rTzRYTFNFRmtKQXY4MTFHWHdBNW1LbWkiLCJvaWF0IjoxNzg1NjU0NjQ3LCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3ODU2NTQ3MDcsImZ2YSI6WzAsLTFdLCJpYXQiOjE3ODU2NTQ2NDcsImlzcyI6Imh0dHBzOi8vc2hhcmluZy1tb29zZS01NC5jbGVyay5hY2NvdW50cy5kZXYiLCJuYmYiOjE3ODU2NTQ2MzcsInNpZCI6InNlc3NfM0hMa0ZHdXhoaEpBdUlzU0FPSFdFVkgyNmpUIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zSExrRkdHRGRMZW9ETEZyc1N1SHp5Wmc0bDMiLCJ2IjoyfQ.YVnlALqozurrQ8wMVxip5uJYUl3MS4tvqZsJTMyYoctkvZHWwqmxNilfB7uAp1NYSwX1bUQTCZZxSqpTOmya-_7Y-rsfSrsvAl-66_SM8JViSPZ70c8IFN7JhWQX0XPkzKT26ACnJ3NtaXFvocNO3EtXniLC1x1anV7y9v75W9CWi4gMxdaiI50AxyUD5x4nzlJ7kT2TPciDXx57i_BSxK6YOZT0clMQ_GC4MLjr31NEmkU4ZIj2BalR3ectGFhTZLtcMiEyOdRo2YwZIT4JZqWQ270vRQMqchJLzpO53XKPwokzneSGXg8C-kLEpx3ZTFOkBQmIuSN1RVN0HBLJog'
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        print('status', r.getcode())
        print(r.geturl())
        print('body', r.read(1000).decode('utf-8', errors='ignore'))
except urllib.error.HTTPError as e:
    print('http error', e.code)
    print(e.read().decode('utf-8', errors='ignore'))
except Exception as e:
    print('error', type(e).__name__, e)
