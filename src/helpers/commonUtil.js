/**
 * Created by gimbyeongjin on 2018. 5. 31..
 */
export default {
  isRelease(releaseDate) {
    return releaseDate <= (new Date).getTime();
  },
  getBorder(releaseDate){
    if(this.isRelease(releaseDate)) return "border-success";
    return "border-danger";
  }
}
