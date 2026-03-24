const { getLogs, getLogsCount, getDistinctActions } = require("./queries");

const listLogs = async (req, res) => {
  const { search = "", action_filter = "", page = 1, limit = 25 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [logs, total] = await Promise.all([
      getLogs({ search, action_filter, limit: parseInt(limit), offset }),
      getLogsCount({ search, action_filter }),
    ]);

    res.json({
      data: logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List activity logs error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const listActions = async (req, res) => {
  try {
    const actions = await getDistinctActions();
    res.json(actions);
  } catch (error) {
    console.error("List actions error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { listLogs, listActions };
