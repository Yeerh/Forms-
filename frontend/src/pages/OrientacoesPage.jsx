import { useNavigate } from "react-router-dom";

const orientacoes = [
  "As informações devem ser validadas pela Secretaria antes do envio.",
  "Preencher todos os campos obrigatórios.",
  "Em caso de dúvida, utilizar o campo de observação.",
  "O não envio compromete o acompanhamento da gestão.",
  "Estamos disponíveis para qualquer esclarecimento.",
];

function OrientacoesPage() {
  const navigate = useNavigate();

  return (
    <section className="orientation-page">
      <article className="orientation-card">
        <h2>Orientações para envio</h2>
        <p className="orientation-intro">
          Antes de iniciar, revise os pontos abaixo para garantir a qualidade das informações:
        </p>

        <ul>
          {orientacoes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <button type="button" className="primary-button" onClick={() => navigate("/formulario")}>
          Iniciar Preenchimento
        </button>
      </article>
    </section>
  );
}

export default OrientacoesPage;

