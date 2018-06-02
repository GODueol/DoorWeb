/**
 * Created by gimbyeongjin on 2018. 5. 31..
 */
export default {
  OneYear : 60*60*24*365,
  isRelease(date) {
    return date <= (new Date).getTime();
  },
  getBorder(date){
    if(this.isOneYear(date)) return "border-warning";
    if(this.isRelease(date)) return "border-success";
    return "border-danger";
  },
  isOneYear(date) {
    return (new Date).getTime() - date >= this.OneYear; // 1년
  }
}
