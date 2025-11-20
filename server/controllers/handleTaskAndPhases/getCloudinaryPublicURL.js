export function getCloudinaryPublicId(url) {
  if (!url) return null;

  const parts = url.split("/");
  const fileName = parts.pop();                     
  const folderPath = parts.slice(7).join("/");      
  return `${folderPath}/${fileName.split(".")[0]}`; 
}