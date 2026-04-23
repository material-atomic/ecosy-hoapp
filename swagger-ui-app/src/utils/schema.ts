/* eslint-disable @typescript-eslint/no-explicit-any */
function resolveRef(ref: string, openApi: any): any {
  if (!ref.startsWith('#/')) return null;
  const path = ref.split('/').slice(1);
  let current = openApi;
  for (const p of path) {
    if (!current) return null;
    current = current[p];
  }
  return current;
}

export function generateSampleFromSchema(schema: any, openApi: any = null, seen = new WeakSet()): any {
  if (!schema) return null;
  if (typeof schema !== 'object') return schema;
  
  if (seen.has(schema)) return {};
  seen.add(schema);

  if (schema.$ref && openApi) {
    const resolved = resolveRef(schema.$ref, openApi);
    return generateSampleFromSchema(resolved, openApi, seen);
  }

  if (schema.example !== undefined) return schema.example;

  if (schema.allOf) {
    const result = {};
    for (const sub of schema.allOf) {
       const subResult = generateSampleFromSchema(sub, openApi, seen);
       if (subResult && typeof subResult === 'object') {
         Object.assign(result, subResult);
       }
    }
    return result;
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateSampleFromSchema(schema.oneOf[0], openApi, seen);
  }
  
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateSampleFromSchema(schema.anyOf[0], openApi, seen);
  }

  const type = schema.type;
  switch (type) {
    case 'string':
      if (schema.format === 'date-time') return '2023-01-01T00:00:00Z';
      if (schema.format === 'date') return '2023-01-01';
      return 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return true;
    case 'array':
      if (schema.items) {
        return [generateSampleFromSchema(schema.items, openApi, seen)];
      }
      return [];
    case 'object':
      if (schema.properties) {
        const obj: Record<string, any> = {};
        for (const key in schema.properties) {
          obj[key] = generateSampleFromSchema(schema.properties[key], openApi, seen);
        }
        return obj;
      }
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
         return {
            "additionalProp1": generateSampleFromSchema(schema.additionalProperties, openApi, seen)
         }
      }
      return {};
    default:
      if (schema.properties) {
        const obj: Record<string, any> = {};
        for (const key in schema.properties) {
          obj[key] = generateSampleFromSchema(schema.properties[key], openApi, seen);
        }
        return obj;
      }
      return null;
  }
}

export function extractExampleFromContent(content: any, openApi: any = null): any {
  if (!content) return null;
  
  const contentType = Object.keys(content).find(key => key.includes('json')) || Object.keys(content)[0];
  if (!contentType) return content;
  
  const mediaTypeObj = content[contentType];
  if (mediaTypeObj.example !== undefined) return mediaTypeObj.example;
  
  if (mediaTypeObj.schema) {
    return generateSampleFromSchema(mediaTypeObj.schema, openApi);
  }
  
  return content;
}
