export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const formatMessageTime = (time: string): string => {
  const date = new Date(time);
  return date.toLocaleTimeString();
}