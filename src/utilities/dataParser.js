function extractMultipleTaggedData(text) {
  const results = [];
  let currentItem = {};
  
  // Regex to capture the tag name and the content between the opening and closing tags
  const regex = /{\/([A-Za-z]+)\/}([\s\S]*?){\/\1\/}/g;
  let match;
  
  // Loop through all matches found in the text
  while ((match = regex.exec(text)) !== null) {
    const tagName = match[1];           
    const content = match[2].trim();    
    const objectKey = tagName.charAt(0).toLowerCase() + tagName.slice(1);
    
    // START A NEW OBJECT IF:
    // 1. We hit a 'claim' tag AND our current item already has properties.
    // 2. OR we hit a tag we've already recorded in the current item (handles missing tags gracefully).
    if ((objectKey === 'claim' && Object.keys(currentItem).length > 0) || currentItem.hasOwnProperty(objectKey)) {
      results.push(currentItem);
      currentItem = {}; // Reset for the next block
    }
    
    // Add the key-value pair to the current object
    currentItem[objectKey] = content;
  }
  
  // Push the very last object into the array after the loop finishes
  if (Object.keys(currentItem).length > 0) {
    results.push(currentItem);
  }
  
  return results;
}

export default extractMultipleTaggedData;