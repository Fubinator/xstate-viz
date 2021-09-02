import { Box, ChakraProvider } from '@chakra-ui/react';
import { useActor, useInterpret, useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { AppProvider, selectAppMode } from './AppContext';
import { appMachine } from './appMachine';
import { useAuth } from './authContext';
import { CanvasProvider } from './CanvasContext';
import { CanvasView } from './CanvasView';
import './Graph';
import { HeaderView } from './HeaderView';
import { isOnClientSide } from './isOnClientSide';
import { MachineNameChooserModal } from './MachineNameChooserModal';
import { PaletteProvider } from './PaletteContext';
import { paletteMachine } from './paletteMachine';
import { PanelsView } from './PanelsView';
import { SimulationProvider } from './SimulationContext';
import { simulationMachine } from './simulationMachine';
import { getSourceActor } from './sourceMachine';
import { theme } from './theme';
import { EditorThemeProvider } from './themeContext';
import { useInterpretCanvas } from './useInterpretCanvas';

function App() {
  const paletteService = useInterpret(paletteMachine);
  // don't use `devTools: true` here as it would freeze your browser
  const simService = useInterpret(simulationMachine);
  const appService = useInterpret(appMachine);
  const machine = useSelector(simService, (state) => {
    return state.context.currentSessionId
      ? state.context.serviceDataMap[state.context.currentSessionId!]?.machine
      : undefined;
  });

  const sourceService = useSelector(useAuth(), getSourceActor);
  const [sourceState, sendToSourceService] = useActor(sourceService!);

  useEffect(() => {
    sendToSourceService({
      type: 'MACHINE_ID_CHANGED',
      id: machine?.id || '',
    });
  }, [machine?.id, sendToSourceService]);

  const sourceID = sourceState.context.sourceID;

  const canvasService = useInterpretCanvas({
    sourceID,
  });

  const appMode = useSelector(appService, selectAppMode);

  if (!isOnClientSide()) return null;

  return (
    <ChakraProvider theme={theme}>
      <EditorThemeProvider>
        <PaletteProvider value={paletteService}>
          <SimulationProvider value={simService}>
            <AppProvider value={appService}>
              <Box
                data-testid="app"
                data-viz="app"
                data-viz-theme="dark"
                data-viz-mode={appMode}
                as="main"
                height="100vh"
              >
                <HeaderView gridArea="header" />
                <CanvasProvider value={canvasService}>
                  <CanvasView />
                </CanvasProvider>
                <PanelsView />
                <MachineNameChooserModal />
              </Box>
            </AppProvider>
          </SimulationProvider>
        </PaletteProvider>
      </EditorThemeProvider>
    </ChakraProvider>
  );
}

export default App;
