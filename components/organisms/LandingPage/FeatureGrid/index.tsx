import { FEATURES, STEPS } from "../landingContent";
import style from "./FeatureGrid.module.scss";

export function FeatureGrid() {
  return (
    <section className={style.section}>
      <div className={style.header}>
        <h2 className={style.title}>Everything the conversation needs</h2>
        <p className={style.subtitle}>
          Built for the part of game writing that spreadsheets are bad at: the shape of the branch.
        </p>
      </div>

      <div className={style.grid}>
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article key={title} className={style.card}>
            <span className={style.cardIcon}><Icon size={16} /></span>
            <h3 className={style.cardTitle}>{title}</h3>
            <p className={style.cardDesc}>{description}</p>
          </article>
        ))}
      </div>

      <ol className={style.steps}>
        {STEPS.map(({ number, title, description }) => (
          <li key={number} className={style.step}>
            <span className={style.stepNumber}>{number}</span>
            <h3 className={style.stepTitle}>{title}</h3>
            <p className={style.stepDesc}>{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
