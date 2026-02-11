<?php
// Configurar manipulador de erros personalizado
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("Erro PHP [{$errno}]: {$errstr} em {$errfile}:{$errline}");
    
    // Exibir o erro se os erros estiverem habilitados
    if (ini_get('display_errors')) {
        echo "<h1>Erro detectado</h1>";
        echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($errstr) . "</p>";
        echo "<p><strong>Arquivo:</strong> " . htmlspecialchars($errfile) . " na linha " . $errline . "</p>";
    }
    
    // Retornar false permite que o manipulador de erros padrão do PHP também execute
    return false;
});

// Manipulador de exceções
set_exception_handler(function($exception) {
    $message = $exception->getMessage();
    $file = $exception->getFile();
    $line = $exception->getLine();
    $trace = $exception->getTraceAsString();
    
    error_log("Exceção não capturada: {$message} em {$file}:{$line}");
    error_log("Stack trace: " . $trace);
    
    if (ini_get('display_errors')) {
        echo "<h1>Exceção detectada</h1>";
        echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($message) . "</p>";
        echo "<p><strong>Arquivo:</strong> " . htmlspecialchars($file) . " na linha " . $line . "</p>";
        echo "<p><strong>Stack trace:</strong></p>";
        echo "<pre>" . htmlspecialchars($trace) . "</pre>";
    }
});

// Ponto de entrada da aplicação
// Verificar ambiente e carregar configurações
$environment = 'development';
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Definir constantes para caminhos
define('BASEPATH', dirname(__DIR__));
define('APPPATH', BASEPATH . '/app');
define('VIEWPATH', APPPATH . '/views');

// Incluir o autoloader
require_once BASEPATH . '/autoload.php';

// Inicializar o middleware de autenticação
require_once APPPATH . '/middleware/AuthMiddleware.php';
$auth = new \App\Middleware\AuthMiddleware();

// Requisição de rota simples
$uri = $_SERVER['REQUEST_URI'];
$uri = trim($uri, '/');

// Remover parâmetros GET da URI
$uri = preg_replace('/\?.*$/', '', $uri);

// Remover o prefixo 'pcpflorlinda' e 'public' da URI se estiverem presentes
$uri = preg_replace('#^pcpflorlinda(?:/public)?/?#', '', $uri);

// Debug detalhado - Exibir a URI após o processamento
error_log("URI original: " . $_SERVER['REQUEST_URI']);
error_log("URI após limpeza: " . $uri);
error_log("HTTP_HOST: " . $_SERVER['HTTP_HOST']);
error_log("BASE_URL: " . (defined('BASE_URL') ? BASE_URL : 'Não definido'));
error_log("AMBIENTE: " . (defined('AMBIENTE') ? AMBIENTE : 'Não definido'));

// Verificar autenticação
$auth->verificarAutenticacao($uri);

// Adicionar verificação de autenticação para todas as rotas não públicas
$rotasPublicas = ['login', 'logout', '', 'index.php', 'session_test.php', 'redirect_test.php', 'login_direct.php'];
if (!in_array($uri, $rotasPublicas) && $uri != 'login_direct.php') {
    // Iniciar sessão se ainda não foi iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Verificar se o usuário está autenticado
    if (!isset($_SESSION['usuario'])) {
        // Verificar se os headers já foram enviados
        if (headers_sent($file, $line)) {
            echo "<script>window.location.href = '" . url('login') . "';</script>";
            echo "Você não está autenticado. <a href='" . url('login') . "'>Clique aqui</a> para fazer login.";
            exit;
        } else {
            header('Location: ' . url('login'));
            exit;
        }
    }
}

// Debug apenas no ambiente de desenvolvimento
// Comentando por enquanto para determinar a causa do erro 500
/*
if (defined('AMBIENTE') && AMBIENTE === 'desenvolvimento') {
    error_log("Ambiente: " . (defined('AMBIENTE') ? AMBIENTE : 'não definido'));
    error_log("URI original: " . $_SERVER['REQUEST_URI']);
    error_log("URI após limpeza: " . $uri);
    error_log("Método HTTP: " . $_SERVER['REQUEST_METHOD']);
    error_log("GET data: " . print_r($_GET, true));
    error_log("POST data: " . print_r($_POST, true));
}
*/

// Roteamento simples
try {
    // Capturar erros para mostrar informações úteis
    error_log("Tentando processar rota: " . $uri);
    
    if (empty($uri) || $uri == 'index.php') {
        // Verificar se o usuário está autenticado
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['usuario'])) {
            header('Location: ' . url('login'));
        } else {
            header('Location: ' . url('home'));
        }
        exit;
    } elseif ($uri == 'home') {
        // Verificar se o usuário está autenticado
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['usuario'])) {
            header('Location: ' . url('login'));
            exit;
        }
        
        require_once APPPATH . '/controllers/HomeController.php';
        $controller = new \App\Controllers\HomeController();
        $controller->index();
    } elseif (strpos($uri, 'colecoes') === 0) {
        error_log("Carregando controller de coleções");
        try {
            require_once APPPATH . '/controllers/ColecaoController.php';
            $controller = new \App\Controllers\ColecaoController();
            
            $parts = explode('/', $uri);
            $action = isset($parts[1]) ? $parts[1] : 'index';
            $id = isset($parts[2]) ? $parts[2] : null;
            
            error_log("Rota de coleções - Action: " . $action . ", ID: " . $id);
            
            switch ($action) {
                case 'novo':
                    $controller->novo();
                    break;
                case 'detalhes':
                    if (!$id) {
                        throw new \Exception('ID não fornecido para detalhes');
                    }
                    $controller->detalhes($id);
                    break;
                case 'editar':
                    if (!$id) {
                        throw new \Exception('ID não fornecido para edição');
                    }
                    $controller->editar($id);
                    break;
                case 'excluir':
                    if (!$id) {
                        throw new \Exception('ID não fornecido para exclusão');
                    }
                    $controller->excluir($id);
                    break;
                case 'atualizar-status':
                    if (!$id) {
                        throw new \Exception('ID não fornecido para atualização de status');
                    }
                    $controller->atualizarStatus($id);
                    break;
                default:
                    $controller->index();
                    break;
            }
        } catch (\Exception $e) {
            error_log("Erro no controller de coleções: " . $e->getMessage());
            throw $e;
        }
    } elseif (strpos($uri, 'referencias') === 0) {
        error_log("Carregando controller de referências");
        try {
            require_once APPPATH . '/controllers/ReferenciaController.php';
            $controller = new \App\Controllers\ReferenciaController();
            
            $parts = explode('/', $uri);
            $action = isset($parts[1]) ? $parts[1] : 'index';
            $id = isset($parts[2]) ? $parts[2] : null;
            
            switch ($action) {
                case 'novo':
                    $controller->novo();
                    break;
                case 'detalhes':
                    $controller->detalhes($id);
                    break;
                case 'editar':
                    $controller->editar($id);
                    break;
                case 'excluir':
                    $controller->excluir($id);
                    break;
                case 'excluir-etapa':
                    $controller->excluirEtapa($id);
                    break;
                case 'busca':
                    $controller->busca();
                    break;
                case 'atualizarStatus':
                    $controller->atualizarStatus();
                    break;
                case 'adicionar-etapa':
                    $controller->adicionarEtapa();
                    break;
                default:
                    $controller->index();
                    break;
            }
        } catch (\Exception $e) {
            error_log("Erro no controller de referências: " . $e->getMessage());
            throw $e;
        }
    } elseif (strpos($uri, 'producao') === 0) {
        error_log("Carregando controller de produção");
        try {
            require_once APPPATH . '/controllers/ProducaoController.php';
            $controller = new \App\Controllers\ProducaoController();
            
            $parts = explode('/', $uri);
            $action = isset($parts[1]) ? $parts[1] : 'index';
            $id = isset($parts[2]) ? $parts[2] : null;
            
            switch ($action) {
                case 'novo':
                    $controller->novo();
                    break;
                case 'detalhes':
                    $controller->detalhes($id);
                    break;
                case 'editar':
                    $controller->editar($id);
                    break;
                case 'excluir':
                    $controller->excluir($id);
                    break;
                case 'atualizar-etapa':
                    $controller->atualizarEtapa();
                    break;
                default:
                    $controller->index();
                    break;
            }
        } catch (\Exception $e) {
            error_log("Erro no controller de produção: " . $e->getMessage());
            throw $e;
        }
    } elseif (strpos($uri, 'relatorios/producao-por-colecao') === 0) {
        require_once APPPATH . '/controllers/ProducaoController.php';
        $controller = new \App\Controllers\ProducaoController();
        $controller->producaoPorColecao();
    } elseif (strpos($uri, 'relatorios') === 0) {
        require_once APPPATH . '/controllers/RelatorioController.php';
        $controller = new \App\Controllers\RelatorioController();
        
        $parts = explode('/', $uri);
        $action = isset($parts[1]) ? $parts[1] : 'index';
        
        switch ($action) {
            case 'atrasos':
                $controller->atrasos();
                break;
            case 'etapas':
                $controller->etapas();
                break;
            default:
                $controller->index();
                break;
        }
    } elseif (strpos($uri, 'admin') === 0) {
        error_log("Carregando controller de administração");
        try {
            require_once APPPATH . '/controllers/AdminController.php';
            $controller = new \App\Controllers\AdminController();
            
            $parts = explode('/', $uri);
            $action = isset($parts[1]) ? $parts[1] : 'index';
            $subaction = isset($parts[2]) ? $parts[2] : null;
            $id = isset($parts[3]) ? $parts[3] : null;
            
            switch ($action) {
                case 'usuarios':
                    switch ($subaction) {
                        case 'novo':
                            $controller->novoUsuario();
                            break;
                        case 'editar':
                            if (!$id) {
                                throw new \Exception('ID não fornecido para edição');
                            }
                            $controller->editarUsuario($id);
                            break;
                        case 'salvar':
                            $controller->salvarUsuario();
                            break;
                        case 'toggle':
                            if (!$id) {
                                throw new \Exception('ID não fornecido para toggle');
                            }
                            $controller->toggleUsuario($id);
                            break;
                        case 'excluir':
                            if (!$id) {
                                throw new \Exception('ID não fornecido para exclusão');
                            }
                            $controller->excluirUsuario($id);
                            break;
                        default:
                            $controller->usuarios();
                            break;
                    }
                    break;
                case 'configuracoes':
                    $controller->configuracoes();
                    break;
                case 'logs':
                    $controller->logs();
                    break;
                default:
                    $controller->index();
                    break;
            }
        } catch (\Exception $e) {
            error_log("Erro no controller de administração: " . $e->getMessage());
            throw $e;
        }
    } elseif ($uri == 'login') {
        // Garantir que a sessão seja iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        require_once APPPATH . '/controllers/AuthController.php';
        $controller = new \App\Controllers\AuthController();
        $controller->login();
    } elseif ($uri == 'logout') {
        require_once APPPATH . '/controllers/AuthController.php';
        $controller = new \App\Controllers\AuthController();
        $controller->logout();
    } else {
        // Debug
        error_log("Rota não encontrada: " . $uri);
        // Rota não encontrada - página 404
        header("HTTP/1.0 404 Not Found");
        echo "<h1>Página não encontrada</h1>";
        echo "<p>URI: " . htmlspecialchars($uri) . "</p>";
        exit;
    }
} catch (Exception $e) {
    error_log("Erro: " . $e->getMessage());
    echo "<h1>Erro no Sistema</h1>";
    echo "<p>Ocorreu um erro ao processar sua requisição. Por favor, tente novamente mais tarde.</p>";
    if ($environment === 'development') {
        echo "<pre>";
        echo "Erro: " . $e->getMessage() . "\n";
        echo "Arquivo: " . $e->getFile() . "\n";
        echo "Linha: " . $e->getLine() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString();
        echo "</pre>";
    }
    exit;
} 