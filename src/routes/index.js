import postRoute from "./postRoute.js";
import userRoute from "./userRoute.js";
import imageRoute from "./imageRoute.js";
import commentRoute from "./commentRoute.js";
import ortherRoute from "./ortherRoute.js";
import bookingRoute from "./bookingRoute.js";
import traffic from "./trafficRoute.js";
import replace from "./replace.route.js";
import settingRoute from "./setting.route.js";

function route(app) {
  app.use("/api", postRoute);
  app.use("/api", userRoute);
  app.use("/api", imageRoute);
  app.use("/api", userRoute);
  app.use("/api", commentRoute);
  app.use("/api", ortherRoute);
  app.use("/api", bookingRoute);
  app.use("/api", traffic);
  app.use("/api", replace);
  app.use("/api", settingRoute);
}
export default route;
