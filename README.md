# Simulador de Controle de Velocidade de Motor AC - Versão Avançada

Bem-vindo ao nosso sistema avançado de simulação e monitoramento de motores AC! Este projeto foi desenvolvido como parte da Atividade A3 de Eletrônica Industrial do curso de Engenharia. O objetivo é oferecer um simulador interativo para controle e análise de desempenho de um motor AC, utilizando um circuito de controle com SCR.

## Índice

- [Visão Geral do Projeto](#visão-geral-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Utilizar](#como-utilizar)
- [Sobre o Circuito](#sobre-o-circuito)
- [Autores](#autores)
- [Referências](#referências)

---

## Visão Geral do Projeto

Este simulador permite controlar e monitorar a velocidade de um motor AC através de um sistema de controle baseado em SCR. A interface exibe em tempo real a velocidade, potência, corrente, tensão, temperatura e eficiência operacional do motor. Além disso, apresenta um diagrama do circuito e detalhes sobre cada componente.

## Funcionalidades

- **Simulação e Controle do Motor:** Possibilidade de ligar/desligar o motor e ajustar a velocidade via controle deslizante.
- **Indicadores Visuais:** Exibição de gráficos em tempo real para monitoramento de parâmetros operacionais como velocidade, potência e corrente.
- **Painel de Componentes:** Informações detalhadas sobre cada componente do circuito, disponíveis ao clicar em seus nomes.
- **Modais Explicativos:** Modal que explica o diagrama do circuito, o funcionamento do sistema e informações sobre os componentes.
- **Indicadores de Status:** Avisos sobre condições críticas de operação (ex. temperatura alta, eficiência baixa).

## Estrutura do Projeto

- **HTML**: Estrutura básica do simulador e organização dos elementos.
- **CSS**: Estilização do layout, incluindo o uso de Bootstrap.
- **JavaScript**: Scripts para interação do usuário, controle dos modais e gráficos em tempo real.

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- [Bootstrap 5](https://getbootstrap.com/) (para estilização)
- Gráficos com `canvas` para visualização de dados em tempo real.

## Como Utilizar

1. Clone ou faça o download do repositório.
2. Abra o arquivo `index.html` no navegador para iniciar a simulação.
3. Use o controle deslizante para ajustar a velocidade do motor e observe os gráficos que mostram o comportamento do motor em tempo real.
4. Clique nos nomes dos componentes para ver informações detalhadas sobre cada um deles em um modal.
5. Para saber mais sobre o funcionamento do circuito, clique no botão "Apresentação" no início da página.

## Sobre o Circuito

O circuito de controle de velocidade utiliza um **SCR (Retificador Controlado de Silício)**, que permite ajustar a velocidade do motor AC ao controlar o ângulo de disparo. O sistema também é composto por resistores, um potenciômetro, um capacitor de filtro e um motor AC.

### Estrutura do Circuito:

- **Fonte de Alimentação AC (220V)**: Fornece a tensão necessária para o circuito.
- **SCR e Potenciômetro**: Controlam o ângulo de disparo do SCR e a condução de corrente.
- **Motor AC**: Ajusta a velocidade conforme a modulação de potência controlada pelo SCR.

Para mais detalhes, consulte o diagrama de blocos e o esquema dos circuitos incluídos na interface.

## Autores

- **Abelardo Andrade Silva** - RA 821219021
- **Guilherme Lage Andrade** - RA 321215835
- **Muryllo Oliveira Satana** - RA 8222242965
- **Orientadora:** Professora Priscila Borges de Morais

## Referências

1. Rashid, M. H. *Power Electronics: Circuits, Devices, and Applications*. 4ª Edição. Pearson, 2013.
   - Este livro cobre os fundamentos e aplicações de dispositivos de potência, incluindo SCRs, e é uma excelente fonte para entender circuitos de controle de motores.

2. Alexander, C. K., & Sadiku, M. N. O. *Fundamentals of Electric Circuits*. McGraw-Hill, 2016.
   - Uma referência fundamental para estudantes de eletrônica, que cobre os princípios básicos de circuitos elétricos, incluindo dispositivos semicondutores como SCRs.
