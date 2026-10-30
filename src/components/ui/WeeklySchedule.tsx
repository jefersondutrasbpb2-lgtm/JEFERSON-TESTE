import { weekly, weekdays, formatTime } from "@/content/data";
import { getLocale, t } from "@/i18n/server";
import { Pending } from "./Pending";

export function WeeklySchedule() {
  const locale = getLocale();
  return (
    <ul className="schedule" data-reveal="stagger">
      {weekly.map((item) => (
        <li key={item.id} className="schedule__item">
          <span className="schedule__day">{weekdays[locale][item.dayIndex]}</span>
          <span className="schedule__time">
            <time dateTime={item.time}>{formatTime(item.time, locale)}</time>
          </span>
          <span>
            <span className="schedule__title">
              {t(item.title)} <Pending show={item.pending} label="horário a confirmar" />
            </span>
            {item.description && <span className="schedule__desc">{t(item.description)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
