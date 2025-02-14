function objectToMapWithChill(obj: any): Map<string, any> {
    const map = new Map<string, any>();
  
    function recursiveHelper(input: any, parentKey: string = '') {
      if (Array.isArray(input)) {
        // If input is an array, iterate through each element and recurse
        input.forEach((item, index) => {
          recursiveHelper(item, `${parentKey}[${index}]`);
        });
      } else if (typeof input === 'object' && input !== null) {
        // If input is an object, iterate through its properties
        Object.entries(input).forEach(([key, value]) => {
          // Create a new key by combining parentKey and current key
          const newKey = parentKey ? `${parentKey}.${key}` : key;
          
          // Recursively call the function for nested structures
          if (typeof value === 'object') {
            recursiveHelper(value, newKey);
          } else {
            map.set(newKey, value);
          }
        });
      } else {
        // If input is a primitive, just set the value
        map.set(parentKey, input);
      }
    }
  
    recursiveHelper(obj); // Start recursion
    return map;
  }
  
  // Example input
  const nestedObject = {
    sender: 'orai1qpuundpvtymcyq3cmcty3udf2zy0m509w4kg8w',
    contract: 'orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh',
    msg: {
      send: {
        contract: 'orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0',
        amount: '500000',
        msg: [
          { denom: 'orai', amount: '1000' }
        ]
      }
    },
    funds: [ { denom: 'orai', amount: '1000' } ]
  };
  
  // Usage
  const keyValueMap = objectToMapWithChill(nestedObject);
  console.log(keyValueMap);
  