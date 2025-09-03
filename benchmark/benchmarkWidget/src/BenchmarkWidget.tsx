import {
  ReactElement,
  createElement,
} from "react";
import { CalendarWidget } from "./components/CalendarWidget";

import "./ui/BenchmarkWidget.css";

export function BenchmarkWidget(): ReactElement {
  return (
    <CalendarWidget />
  );
}
