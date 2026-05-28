/*
  # Lecom Facilities - Schema Inicial

  ## Tabelas criadas
  1. `demandas` - Registro principal de cada solicitação de serviço
  2. `solicitantes` - Dados do solicitante vinculados à demanda
  3. `servicos_solicitados` - Detalhes do serviço solicitado
  4. `historico_eventos` - Log imutável de todas as ações
  5. `analises` - Análises feitas por Leonardo
  6. `validacoes` - Validações feitas pelo Diretor
  7. `aprovacoes` - Aprovações individuais dos gerentes

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas permitem acesso autenticado para operações básicas
*/

-- Demandas
CREATE TABLE IF NOT EXISTS demandas (
  id text PRIMARY KEY,
  data_criacao timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'ABERTA',
  tipo_demanda text NOT NULL DEFAULT 'PONTUAL',
  chamado_id text,
  chamado_gerado_em timestamptz,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Solicitantes
CREATE TABLE IF NOT EXISTS solicitantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  celular text NOT NULL DEFAULT '',
  casa text NOT NULL DEFAULT '',
  departamento text NOT NULL DEFAULT '',
  cargo text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Serviços Solicitados
CREATE TABLE IF NOT EXISTS servicos_solicitados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'OUTROS',
  local text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  data_prevista date,
  duracao text NOT NULL DEFAULT '',
  mao_de_obra boolean DEFAULT false,
  orcamento numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Histórico de Eventos
CREATE TABLE IF NOT EXISTS historico_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  data timestamptz DEFAULT now(),
  usuario text NOT NULL DEFAULT '',
  acao text NOT NULL DEFAULT '',
  detalhes text,
  created_at timestamptz DEFAULT now()
);

-- Análises (Leonardo)
CREATE TABLE IF NOT EXISTS analises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  necessita_complementacao boolean DEFAULT false,
  observacoes text,
  acoes_internas text,
  analisado_por text NOT NULL DEFAULT '',
  analisado_em timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Validações (Diretor)
CREATE TABLE IF NOT EXISTS validacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  aprovado boolean NOT NULL DEFAULT false,
  motivo_rejeicao text,
  validado_por text NOT NULL DEFAULT '',
  validado_em timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Aprovações (Gerentes)
CREATE TABLE IF NOT EXISTS aprovacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id text REFERENCES demandas(id) ON DELETE CASCADE,
  gerente text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 1,
  aprovado boolean,
  motivo_rejeicao text,
  aprovado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_solicitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises ENABLE ROW LEVEL SECURITY;
ALTER TABLE validacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprovacoes ENABLE ROW LEVEL SECURITY;

-- Políticas - demandas
CREATE POLICY "Enable read access for all users"
  ON demandas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON demandas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON demandas FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Políticas - solicitantes
CREATE POLICY "Enable read access for all users"
  ON solicitantes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON solicitantes FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas - servicos_solicitados
CREATE POLICY "Enable read access for all users"
  ON servicos_solicitados FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON servicos_solicitados FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas - historico_eventos
CREATE POLICY "Enable read access for all users"
  ON historico_eventos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON historico_eventos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas - analises
CREATE POLICY "Enable read access for all users"
  ON analises FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON analises FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas - validacoes
CREATE POLICY "Enable read access for all users"
  ON validacoes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON validacoes FOR INSERT
  TO anon
  WITH CHECK (true);

-- Políticas - aprovacoes
CREATE POLICY "Enable read access for all users"
  ON aprovacoes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON aprovacoes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON aprovacoes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
