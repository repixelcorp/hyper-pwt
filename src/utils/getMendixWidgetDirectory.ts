import path from "node:path";

import getMendixProjectDiectory from "./getMendixProjectDirectory";

const getMendixWidgetDirectory = async () => {
  const mendixPath = await getMendixProjectDiectory();

  return path.join(mendixPath, "widgets");
};

export default getMendixWidgetDirectory;
