
import React, { useState } from 'react';

// Importar todos os componentes convertidos pelo Gemini
import { AddFoodLogic } from './src/components/AddFoodLogic';
import { AddFoodToDiary } from './src/components/AddFoodToDiary';
import { AppState } from './src/components/AppState';
import { Auth } from './src/components/Auth';
import { BannerCarousel } from './src/components/BannerCarousel';
import { BarcodeScanner } from './src/components/BarcodeScanner';
import { BottomNav } from './src/components/BottomNav';
import { Common } from './src/components/Common';
import { Content } from './src/components/Content';
import { CreateCustomFood } from './src/components/CreateCustomFood';
import { DashboardLogic } from './src/components/DashboardLogic';
import { Dashboard } from './src/components/Dashboard';
import { DiaryLogic } from './src/components/DiaryLogic';
import { Diary } from './src/components/Diary';
import { EditMeal } from './src/components/EditMeal';
import { EditProfileLogic } from './src/components/EditProfileLogic';
import { EditProfile } from './src/components/EditProfile';
import { ExploreRecipes } from './src/components/ExploreRecipes';
import { FavoriteLogic } from './src/components/FavoriteLogic';
import { FavoriteRecipes } from './src/components/FavoriteRecipes';
import { IconFallback } from './src/components/IconFallback';
import { Index } from './src/components/Index';
import { JustgageMinJs } from './src/components/JustgageMinJs';
import { JustgageComponent } from './src/components/JustgageComponent';
import { Login } from './src/components/Login';
import { MainApp } from './src/components/MainApp';
import { MeasurementsLogic } from './src/components/MeasurementsLogic';
import { MeasurementsProgress } from './src/components/MeasurementsProgress';
import { MoreOptionsLogic } from './src/components/MoreOptionsLogic';
import { MoreOptions } from './src/components/MoreOptions';
import { NetworkMonitor } from './src/components/NetworkMonitor';
import { Onboarding } from './src/components/Onboarding';
import { PageTransitions } from './src/components/PageTransitions';
import { PointsHistoryLogic } from './src/components/PointsHistoryLogic';
import { PointsHistory } from './src/components/PointsHistory';
import { ProfileOverviewLogic } from './src/components/ProfileOverviewLogic';
import { ProgressLogic } from './src/components/ProgressLogic';
import { Progress } from './src/components/Progress';
import { Ranking } from './src/components/Ranking';
import { RaphaelMinJs } from './src/components/RaphaelMinJs';
import { Register } from './src/components/Register';
import { RoutineCircular } from './src/components/RoutineCircular';
import { RoutineLogic } from './src/components/RoutineLogic';
import { RoutineWithExerciseTime } from './src/components/RoutineWithExerciseTime';
import { Routine } from './src/components/Routine';
import { ScanBarcode } from './src/components/ScanBarcode';
import { ScriptJs } from './src/components/ScriptJs';
import { ScriptComponent } from './src/components/ScriptComponent';
import { Swjs } from './src/components/Swjs';
import { TemplateBase } from './src/components/TemplateBase';
import { TimePicker } from './src/components/TimePicker';
import { ToastHelper } from './src/components/ToastHelper';
import { ViewContent } from './src/components/ViewContent';
import { ViewRecipe } from './src/components/ViewRecipe';
import { WeightLogic } from './src/components/WeightLogic';
import { WwwConfig } from './src/components/WwwConfig';


// Definimos um tipo para todas as possíveis visualizações da aplicação,
// garantindo segurança de tipo e autocompletar.
export type ViewName =
  | 'AddFoodLogic'
  | 'AddFoodToDiary'
  | 'AppState'
  | 'Auth'
  | 'BannerCarousel'
  | 'BarcodeScanner'
  | 'BottomNav' // Incluído como view, embora geralmente seja um componente persistente
  | 'Common'
  | 'Content'
  | 'CreateCustomFood'
  | 'DashboardLogic'
  | 'Dashboard'
  | 'DiaryLogic'
  | 'Diary'
  | 'EditMeal'
  | 'EditProfileLogic'
  | 'EditProfile'
  | 'ExploreRecipes'
  | 'FavoriteLogic'
  | 'FavoriteRecipes'
  | 'IconFallback'
  | 'Index'
  | 'JustgageMinJs'
  | 'JustgageComponent'
  | 'Login'
  | 'MainApp'
  | 'MeasurementsLogic'
  | 'MeasurementsProgress'
  | 'MoreOptionsLogic'
  | 'MoreOptions'
  | 'NetworkMonitor'
  | 'Onboarding'
  | 'PageTransitions'
  | 'PointsHistoryLogic'
  | 'PointsHistory'
  | 'ProfileOverviewLogic'
  | 'ProgressLogic'
  | 'Progress'
  | 'Ranking'
  | 'RaphaelMinJs'
  | 'Register'
  | 'RoutineCircular'
  | 'RoutineLogic'
  | 'RoutineWithExerciseTime'
  | 'Routine'
  | 'ScanBarcode'
  | 'ScriptJs'
  | 'ScriptComponent'
  | 'Swjs'
  | 'TemplateBase'
  | 'TimePicker'
  | 'ToastHelper'
  | 'ViewContent'
  | 'ViewRecipe'
  | 'WeightLogic'
  | 'WwwConfig';

// Interface para as props que os componentes de navegação precisam receber.
interface NavigableComponentProps {
  setView: (view: ViewName) => void;
  // Outras props comuns podem ser adicionadas aqui, se necessário (ex: usuário logado)
}

const App: React.FC = () => {
  // O estado 'currentView' gerencia qual componente está sendo exibido no momento.
  // Começamos com a tela de 'Login' como padrão.
  const [currentView, setCurrentView] = useState<ViewName>('Login');

  // Função para atualizar o estado 'currentView', permitindo a navegação entre componentes.
  const setView = (view: ViewName) => {
    setCurrentView(view);
  };

  // Função que renderiza o componente apropriado com base no 'currentView'.
  const renderView = () => {
    // As props a serem passadas para cada componente renderizado.
    const viewProps: NavigableComponentProps = { setView };

    // Um switch case para mapear o nome da view para o componente React correspondente.
    switch (currentView) {
      case 'AddFoodLogic':
        return <AddFoodLogic {...viewProps} />;
      case 'AddFoodToDiary':
        return <AddFoodToDiary {...viewProps} />;
      case 'AppState':
        return <AppState {...viewProps} />;
      case 'Auth':
        return <Auth {...viewProps} />;
      case 'BannerCarousel':
        return <BannerCarousel {...viewProps} />;
      case 'BarcodeScanner':
        return <BarcodeScanner {...viewProps} />;
      case 'BottomNav':
        // BottomNav também pode ser uma view, mas é mais comum como elemento persistente.
        // Se for um elemento persistente, ele seria renderizado fora do switch.
        return <BottomNav {...viewProps} />;
      case 'Common':
        return <Common {...viewProps} />;
      case 'Content':
        return <Content {...viewProps} />;
      case 'CreateCustomFood':
        return <CreateCustomFood {...viewProps} />;
      case 'DashboardLogic':
        return <DashboardLogic {...viewProps} />;
      case 'Dashboard':
        return <Dashboard {...viewProps} />;
      case 'DiaryLogic':
        return <DiaryLogic {...viewProps} />;
      case 'Diary':
        return <Diary {...viewProps} />;
      case 'EditMeal':
        return <EditMeal {...viewProps} />;
      case 'EditProfileLogic':
        return <EditProfileLogic {...viewProps} />;
      case 'EditProfile':
        return <EditProfile {...viewProps} />;
      case 'ExploreRecipes':
        return <ExploreRecipes {...viewProps} />;
      case 'FavoriteLogic':
        return <FavoriteLogic {...viewProps} />;
      case 'FavoriteRecipes':
        return <FavoriteRecipes {...viewProps} />;
      case 'IconFallback':
        return <IconFallback {...viewProps} />;
      case 'Index':
        return <Index {...viewProps} />;
      case 'JustgageMinJs':
        return <JustgageMinJs {...viewProps} />;
      case 'JustgageComponent':
        return <JustgageComponent {...viewProps} />;
      case 'Login':
        return <Login {...viewProps} />;
      case 'MainApp':
        return <MainApp {...viewProps} />;
      case 'MeasurementsLogic':
        return <MeasurementsLogic {...viewProps} />;
      case 'MeasurementsProgress':
        return <MeasurementsProgress {...viewProps} />;
      case 'MoreOptionsLogic':
        return <MoreOptionsLogic {...viewProps} />;
      case 'MoreOptions':
        return <MoreOptions {...viewProps} />;
      case 'NetworkMonitor':
        return <NetworkMonitor {...viewProps} />;
      case 'Onboarding':
        return <Onboarding {...viewProps} />;
      case 'PageTransitions':
        return <PageTransitions {...viewProps} />;
      case 'PointsHistoryLogic':
        return <PointsHistoryLogic {...viewProps} />;
      case 'PointsHistory':
        return <PointsHistory {...viewProps} />;
      case 'ProfileOverviewLogic':
        return <ProfileOverviewLogic {...viewProps} />;
      case 'ProgressLogic':
        return <ProgressLogic {...viewProps} />;
      case 'Progress':
        return <Progress {...viewProps} />;
      case 'Ranking':
        return <Ranking {...viewProps} />;
      case 'RaphaelMinJs':
        return <RaphaelMinJs {...viewProps} />;
      case 'Register':
        return <Register {...viewProps} />;
      case 'RoutineCircular':
        return <RoutineCircular {...viewProps} />;
      case 'RoutineLogic':
        return <RoutineLogic {...viewProps} />;
      case 'RoutineWithExerciseTime':
        return <RoutineWithExerciseTime {...viewProps} />;
      case 'Routine':
        return <Routine {...viewProps} />;
      case 'ScanBarcode':
        return <ScanBarcode {...viewProps} />;
      case 'ScriptJs':
        return <ScriptJs {...viewProps} />;
      case 'ScriptComponent':
        return <ScriptComponent {...viewProps} />;
      case 'Swjs':
        return <Swjs {...viewProps} />;
      case 'TemplateBase':
        return <TemplateBase {...viewProps} />;
      case 'TimePicker':
        return <TimePicker {...viewProps} />;
      case 'ToastHelper':
        return <ToastHelper {...viewProps} />;
      case 'ViewContent':
        return <ViewContent {...viewProps} />;
      case 'ViewRecipe':
        return <ViewRecipe {...viewProps} />;
      case 'WeightLogic':
        return <WeightLogic {...viewProps} />;
      case 'WwwConfig':
        return <WwwConfig {...viewProps} />;
      default:
        // Caso a view solicitada não seja encontrada, retornamos para a página de Login.
        console.warn(`View desconhecida solicitada: ${currentView}. Redirecionando para Login.`);
        return <Login {...viewProps} />;
    }
  };

  // Lista de views onde o BottomNav geralmente não deve aparecer (ex: telas de autenticação).
  const viewsWithoutBottomNav: ViewName[] = ['Login', 'Register', 'Onboarding', 'Index'];

  return (
    <div className="app-wrapper">
      {/* 
        Um container para a view atual. A prop `key={currentView}` é essencial
        para que o React identifique que o componente principal mudou, o que é
        fundamental para que as transições CSS funcionem corretamente.
        Adicionamos classes para facilitar a estilização com CSS, permitindo
        transições ou estilos específicos por view.
      */}
      <div key={currentView} className={`view-transition-wrapper view-${currentView.toLowerCase()}`}>
        {renderView()}
      </div>

      {/* 
        Renderiza o componente BottomNav (navegação inferior) condicionalmente.
        Ele não será exibido nas páginas listadas em `viewsWithoutBottomNav`.
        É importante passar `setView` para o BottomNav para que ele possa
        navegar para outras views.
      */}
      {!viewsWithoutBottomNav.includes(currentView) && (
        <BottomNav setView={setView} currentView={currentView} />
      )}
    </div>
  );
};

export default App;
