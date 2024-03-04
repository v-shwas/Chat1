const sendMessage = (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export { sendMessage };
