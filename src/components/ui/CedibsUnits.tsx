import { bomSamaritano, cedibsTotalServed, cedibsTotalVolunteers } from "@/content/missoes";

/** Números e unidades do CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano. */
export function CedibsUnits() {
  return (
    <div className="cedibs">
      <dl className="cedibs__totals" data-reveal="stagger">
        <div>
          <dt>crianças, adolescentes e jovens atendidos</dt>
          <dd className="numeral" data-count={cedibsTotalServed}>
            {cedibsTotalServed}
          </dd>
        </div>
        <div>
          <dt>unidades</dt>
          <dd className="numeral">{bomSamaritano.units.length}</dd>
        </div>
        <div>
          <dt>voluntários, aproximadamente</dt>
          <dd className="numeral" data-count={cedibsTotalVolunteers}>
            {cedibsTotalVolunteers}
          </dd>
        </div>
      </dl>

      <ul className="cedibs__units" data-reveal="stagger">
        {bomSamaritano.units.map((u) => (
          <li key={u.id} className="cedibs__unit">
            <p className="cedibs__unit-label">{u.label}</p>
            <h3 className="cedibs__unit-city">{u.city}</h3>
            <dl className="cedibs__unit-stats">
              <div>
                <dt>{u.servedLabel}</dt>
                <dd className="numeral">{u.served}</dd>
              </div>
              <div>
                <dt>voluntários ({bomSamaritano.volunteersTitle.toLowerCase()}), aproximadamente</dt>
                <dd className="numeral">{u.volunteers}</dd>
              </div>
            </dl>
            {u.note && <p className="cedibs__unit-note">{u.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
