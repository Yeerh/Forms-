import { useNavigate } from "react-router-dom";

const mensagens = [
  "As informacoes devem ser validadas pela Secretaria antes do envio.",
  "Preencha todos os campos obrigatorios.",
  "Em caso de duvida, use o campo de observacao.",
  "O nao envio compromete o acompanhamento da gestao.",
  "Estamos disponiveis para qualquer esclarecimento.",
];

function AvisoPage() {
  const navigate = useNavigate();

  return (
    <section className="aviso-page">
      <article className="aviso-card">
        <h1 className="aviso-animated-title">Acompanhamento de Projetos</h1>
        <h2>Tela de Aviso</h2>
        <p className="muted">Leia as orientacoes antes de iniciar o preenchimento.</p>

        <ul className="aviso-list">
          {mensagens.map((item) => (
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

export default AvisoPage;
