export const formatDate = (datetime: string) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const data = new Date(datetime);
  if (today === data.setHours(0, 0, 0, 0)) {
    return (
      "Today, " +
      new Date(datetime).toLocaleTimeString("en-US", {
        hour12: false,
      })
    );
  } else {
    return new Date(datetime).toLocaleString("en-US", {
      hour12: false,
    });
  }
};
