export function loadScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // script.type = 'module';  //改成了非module的js文件
    script.src = url;
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    document.head.append(script);
  });
}
