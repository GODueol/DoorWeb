// Date에 관련된 Util

export default {
  afterWeek(weeks) {
    const d = new Date();
    const dayOfMonth = d.getDate();
    d.setDate(dayOfMonth + 7*weeks);
    return d.getTime()
  },
  getDate(date) {
    return new Date(date).toLocaleString();
  }
}

