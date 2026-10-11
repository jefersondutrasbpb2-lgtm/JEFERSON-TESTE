import { weekly, formatTime } from "@/content/data";
import { Pending } from "./Pending";

export function WeeklySchedule() {
  return (
    <ul className="schedule" data-reveal="stagger">
      {weekly.map((item) => (
        <li key={item.id} className="schedule__item">
          <span className="schedule__day">{item.day}</span>
          <span className="schedule__time">
            <time>{formatTime(item.time)}</time>
          </span>
          <span>
            <span className="schedule__title">
              {item.title} <Pending show={item.pending} label="horário a confirmar" />
            </span>
            {item.description && <span className="schedule__desc">{item.description}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
