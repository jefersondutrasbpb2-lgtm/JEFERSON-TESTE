import { bomSamaritano, cedibsTotalServed, cedibsTotalVolunteers } from "@/content/missoes";
import { t } from "@/i18n/server";

/** Números e unidades do CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano. */
export function CedibsUnits() {
  return (
    <div className="cedibs">
      <dl className="cedibs__totals" data-reveal="stagger">
        <div>
          <dt>
            {t({
              pt: "crianças, adolescentes e jovens atendidos",
              en: "children, teenagers and young people served",
              es: "niños, adolescentes y jóvenes atendidos",
            })}
          </dt>
          <dd className="numeral" data-count={cedibsTotalServed}>
            {cedibsTotalServed}
          </dd>
        </div>
        <div>
          <dt>{t({ pt: "unidades", en: "units", es: "unidades" })}</dt>
          <dd className="numeral">{bomSamaritano.units.length}</dd>
        </div>
        <div>
          <dt>{t({ pt: "voluntários, aproximadamente", en: "volunteers, approximately", es: "voluntarios, aproximadamente" })}</dt>
          <dd className="numeral" data-count={cedibsTotalVolunteers}>
            {cedibsTotalVolunteers}
          </dd>
        </div>
      </dl>

      <ul className="cedibs__units" data-reveal="stagger">
        {bomSamaritano.units.map((u) => (
          <li key={u.id} className="cedibs__unit">
            <p className="cedibs__unit-label">{t(u.label)}</p>
            <h3 className="cedibs__unit-city">{u.city}</h3>
            <dl className="cedibs__unit-stats">
              <div>
                <dt>{t(u.servedLabel)}</dt>
                <dd className="numeral">{u.served}</dd>
              </div>
              <div>
                <dt>
                  {t({ pt: "voluntários", en: "volunteers", es: "voluntarios" })} ({t(bomSamaritano.volunteersTitle).toLowerCase()}),{" "}
                  {t({ pt: "aproximadamente", en: "approximately", es: "aproximadamente" })}
                </dt>
                <dd className="numeral">{u.volunteers}</dd>
              </div>
            </dl>
            {u.note && <p className="cedibs__unit-note">{t(u.note)}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
