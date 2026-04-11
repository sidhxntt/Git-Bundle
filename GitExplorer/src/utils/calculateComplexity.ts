const calculateComplexity = (name: string, size?: number): "low" | "medium" | "high" | undefined => {
  const ext = name.split('.').pop()?.toLowerCase();
  
  const lowComplexityExtensions = ['json', 'md', 'txt', 'yml', 'yaml', 'env'];
  if (ext && lowComplexityExtensions.includes(ext)) {
    return 'low';
  }
  
  const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'vue', 'svelte', 'py', 'java', 'go', 'rs'];
  if (ext && codeExtensions.includes(ext)) {
    if (!size) return 'medium';
    if (size < 5000) return 'low';
    if (size < 15000) return 'medium';
    return 'high';
  }
  
  const styleExtensions = ['css', 'scss', 'sass', 'less'];
  if (ext && styleExtensions.includes(ext)) {
    if (!size) return 'low';
    return size > 10000 ? 'medium' : 'low';
  }
  
  return undefined;
}

export default calculateComplexity;