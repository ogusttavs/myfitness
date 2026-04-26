/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

export default function GuiaCoachPage() {
  return (
    <div className="min-h-dvh bg-obsidian text-bone print:bg-white print:text-black">
      <article className="max-w-2xl mx-auto px-6 py-10 print:px-0 print:py-0">
        {/* Header */}
        <header className="mb-10 pb-6 border-b border-smoke print:border-gray-300">
          <p className="text-ash text-xs uppercase tracking-widest print:text-gray-500">modo caverna</p>
          <h1 className="text-bone text-5xl font-display tracking-wider mt-2 print:text-black">GUIA DO COACH</h1>
          <p className="text-mute text-sm mt-3 print:text-gray-600">
            Passo-a-passo para acompanhar seu atleta no app — atualizar treino, dieta, ver progresso e fazer ajustes.
          </p>
        </header>

        {/* Print button */}
        <div className="print:hidden mb-8 flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-6 h-12 rounded-md bg-ember text-obsidian font-display tracking-widest text-sm active:opacity-80"
          >
            BAIXAR PDF / IMPRIMIR
          </button>
          <a
            href="/coach"
            className="px-6 h-12 rounded-md border border-smoke text-bone flex items-center font-display tracking-widest text-sm active:opacity-80"
          >
            ABRIR PAINEL
          </a>
        </div>

        {/* Conteúdo */}
        <Section number="1" title="O que é esse app">
          <p>
            O <strong>Modo Caverna</strong> é o app pessoal do atleta para seguir o protocolo de treino e dieta.
            Como coach, você tem acesso aos dados dele em tempo real para acompanhar a evolução
            e fazer ajustes quando necessário.
          </p>
          <Bullets>
            <li>Atleta registra treinos, refeições, peso e fotos no celular</li>
            <li>Você vê tudo num painel só seu, com resumo da semana</li>
            <li>Pode editar plano de treino e dieta a qualquer momento (em breve)</li>
          </Bullets>
        </Section>

        <Section number="2" title="Como entrar pela primeira vez">
          <Bullets ordered>
            <li>
              Receba o <strong>código de convite</strong> do atleta (6 caracteres, ex.: <Code>A4K2X9</Code>).
              O atleta gera ele em <em>Perfil → Convite pro Coach → Gerar código</em>.
            </li>
            <li>
              Acesse <Code>https://web-xi-neon-37.vercel.app/coach</Code> no seu celular ou computador.
            </li>
            <li>
              Faça login com seu e-mail. Vai chegar um <strong>link mágico</strong> na sua caixa de entrada.
              Clica no link e você está dentro.
            </li>
            <li>
              No painel, clica em <strong>"Adicionar atleta"</strong>, cola o código de 6 caracteres e confirma.
            </li>
            <li>
              Pronto: o atleta aparece na sua lista. Pode entrar para ver os dados dele.
            </li>
          </Bullets>
          <Callout>
            ⚠️ O código expira em <strong>48 horas</strong> e só pode ser usado uma vez.
            Se expirar, peça pro atleta gerar outro.
          </Callout>
        </Section>

        <Section number="3" title="O painel do atleta">
          <p>Quando você abre o nome do atleta, vê:</p>
          <Bullets>
            <li><strong>Dados básicos</strong> — idade, peso atual, altura, nível, objetivo</li>
            <li><strong>KPIs da semana</strong> — quantos treinos fez, refeições marcadas, último peso, número de fotos</li>
            <li><strong>Treinos da semana</strong> — lista com data e status (finalizado / em andamento)</li>
            <li><strong>Fotos recentes</strong> — grid das últimas 6 fotos de progresso</li>
          </Bullets>
        </Section>

        <Section number="4" title="Editar treino do atleta (em breve)">
          <p>
            A edição de planos de treino e dieta pelo coach está sendo finalizada e ficará disponível na próxima atualização.
            O fluxo será assim:
          </p>
          <Bullets>
            <li>Entrar no painel do atleta</li>
            <li>Selecionar o dia (Push/Pull/Legs/Upper/Lower)</li>
            <li>Trocar exercício, séries, reps ou tempo de descanso</li>
            <li>O atleta vê a mudança na próxima vez que abrir o app</li>
            <li>Sessões já registradas não são alteradas (o histórico fica preservado)</li>
          </Bullets>
        </Section>

        <Section number="5" title="Editar dieta do atleta (em breve)">
          <Bullets>
            <li>Entrar no painel do atleta → aba Dieta</li>
            <li>Mudar item de qualquer refeição (ex.: trocar arroz por batata-doce)</li>
            <li>Cadastrar variações/substituições (atleta escolhe no momento)</li>
            <li>Ajustar macros-alvo do dia</li>
          </Bullets>
        </Section>

        <Section number="6" title="O que o atleta usa no dia-a-dia">
          <Bullets>
            <li><strong>Hoje</strong> — landing com treino do dia, refeições, água, suplementos</li>
            <li><strong>Treino</strong> — escolhe o dia → registra carga + reps de cada série → cronômetro automático no descanso</li>
            <li><strong>Dieta</strong> — marca refeições como feitas, vê macros consumidas, escreve observação por dia</li>
            <li><strong>Progresso</strong> — registra peso e sobe fotos (frente/lado/costas)</li>
            <li><strong>Perfil</strong> — vê dados, recomendações, acessa relatórios e gera convite pro coach</li>
          </Bullets>
        </Section>

        <Section number="7" title="Boas práticas pro coach">
          <Bullets>
            <li><strong>Confira o painel 1x por semana</strong> — KPIs mostram aderência</li>
            <li><strong>Olhe as fotos a cada 4 semanas</strong> — momento natural pra reavaliar</li>
            <li><strong>Antes de mudar o plano</strong>, veja últimos treinos: ele atingiu o top range nas últimas 2 sessões? Considera aumentar carga.</li>
            <li><strong>Comunicação direta</strong> com o atleta continua via WhatsApp — o app é pra dados, não pra chat (no MVP)</li>
          </Bullets>
        </Section>

        <Section number="8" title="Segurança e privacidade">
          <Bullets>
            <li>Você só vê dados de atletas que te deram código</li>
            <li>Atleta pode revogar seu acesso a qualquer momento</li>
            <li>Fotos ficam num bucket privado — só você (vinculado) e o atleta acessam</li>
            <li>Nenhum dado é compartilhado com terceiros</li>
          </Bullets>
        </Section>

        <footer className="mt-12 pt-6 border-t border-smoke print:border-gray-300 text-mute text-xs text-center print:text-gray-500">
          <p>Modo Caverna — v0.1 · {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="mt-1">Dúvidas? Fale com o atleta ou veja o app.</p>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-ember font-display text-2xl tracking-wider print:text-orange-600">{number}</span>
        <h2 className="text-bone text-xl font-display tracking-wider print:text-black">{title.toUpperCase()}</h2>
      </div>
      <div className="text-ash text-sm leading-relaxed pl-9 space-y-3 print:text-gray-700">{children}</div>
    </section>
  );
}

function Bullets({ children, ordered = false }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-2 marker:text-ember print:marker:text-orange-600`}>
      {children}
    </Tag>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-elevated border border-smoke px-1.5 py-0.5 rounded print:bg-gray-100 print:border-gray-300 print:text-black">
      {children}
    </code>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border-l-2 border-amberx bg-amberx/10 px-4 py-3 text-amberx text-sm print:bg-yellow-50 print:text-yellow-900 print:border-yellow-500">
      {children}
    </div>
  );
}
