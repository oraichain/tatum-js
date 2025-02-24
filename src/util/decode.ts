import { fromUtf8, fromBase64 } from "@cosmjs/encoding"

export function decodeUInt256(hex: string): number {
  const formattedHex = hex.replace(/^0x/, '') // Remove 0x
  return Number('0x' + formattedHex)
}

export function decodeHexString(hex: string): string {
  const formattedHex = hex.replace(/^(0x)?0+/, '') // Remove 0x and leading zeros
  const byteLength = formattedHex.length / 2
  const bytes = []

  for (let i = 0; i < byteLength; i++) {
    const byte = parseInt(formattedHex.substr(i * 2, 2), 16) // Get the current byte
    bytes.push(byte)
  }

  return bytes
    .map((byte) => String.fromCharCode(byte))
    .filter((char) => /[a-zA-Z0-9]/.test(char))
    .join('')
}

export function decodeNestedObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(decodeNestedObject)
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'msg') {
          if (obj[key] instanceof Uint8Array) {
            newObj[key] = decodeNestedObject(JSON.parse(fromUtf8(obj[key])))
          } else if (typeof obj[key] === 'string') {
            newObj[key] = decodeNestedObject(JSON.parse(fromUtf8(fromBase64(obj[key]))))
          } else {
            newObj[key] = decodeNestedObject(obj[key]) // Handle nested msg objects
          }
        } else {
          newObj[key] = decodeNestedObject(obj[key])
        }
      }
    }
    return newObj
  }
  return obj
}

export function objectToMap(obj: any): [string, any] {
  let response: [string, any] = ['', {}]

  function recursiveHelper(input: any, parentKey: string = '') {
    if (Array.isArray(input)) {
      // If input is an array, iterate through each element and recurse
      input.forEach((item, index) => {
        recursiveHelper(item, `${parentKey}[${index}]`)
      })
    } else if (typeof input === 'object' && input !== null) {
      // If input is an object, iterate through its properties
      Object.entries(input).forEach(([key, value]) => {
        // Create a new key by combining parentKey and current key
        let newKey: string = ''
        let isContinue: boolean = true
        switch (key) {
          case 'swap_and_action':
            isContinue = false
            response = [key, value]
            break
          case 'execute_swap_operations':
            isContinue = false
            response = [key, value]
            break
          default:
            newKey = parentKey ? `${parentKey}.${key}` : key
            break
        }
        // Recursively call the function for nested structures

        if (typeof value === 'object' && isContinue) {
          recursiveHelper(value, newKey)
        }
      })
    }
  }

  recursiveHelper(obj) // Start recursion
  return response
}