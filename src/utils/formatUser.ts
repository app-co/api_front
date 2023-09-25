const formatUsername = (username: string) => {
  const newUsername = username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim()
    .replace(/\s+/g, '')

  return newUsername
}
export default formatUsername
