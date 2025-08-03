// 后端服务检查脚本
const http = require('http');

const API_BASE_URL = 'http://localhost:8000';

// 检查后端服务是否运行
function checkBackendService() {
    console.log('🔍 检查后端服务状态...');
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/health',
        method: 'GET',
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        console.log('✅ 后端服务正在运行');
        console.log(`📊 状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📝 响应内容:', data);
            testMainApis();
        });
    });
    
    req.on('error', (err) => {
        console.error('❌ 后端服务未运行或连接失败:', err.message);
        console.log('\n🛠️  启动后端服务的步骤:');
        console.log('1. 打开终端，进入后端目录: cd ito-deposit');
        console.log('2. 安装依赖: go mod tidy');
        console.log('3. 启动服务: go run cmd/ito-deposit/main.go');
        console.log('4. 或使用 Kratos: kratos run');
        console.log('\n🔍 检查端口占用: netstat -ano | findstr :8000');
    });
    
    req.on('timeout', () => {
        console.error('❌ 请求超时，后端服务可能未响应');
        req.destroy();
    });
    
    req.end();
}

// 测试主要API接口
function testMainApis() {
    console.log('\n🧪 测试主要API接口...');
    
    // 测试寄存点分布接口
    testLockerDistribution();
    
    // 延迟测试其他接口
    setTimeout(() => {
        testNearbySearch();
    }, 2000);
    
    setTimeout(() => {
        testCitiesList();
    }, 4000);
}

// 测试寄存点分布接口
function testLockerDistribution() {
    console.log('\n📍 测试寄存点分布接口...');
    
    const postData = JSON.stringify({
        city: '郑州',
        longitude: 113.6253,
        latitude: 34.7466,
        radius: 10,
        include_unavailable: false
    });
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/api/lockers/distribution',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        console.log(`✅ 寄存点分布接口响应: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📊 返回数据:', {
                    lockers: jsonData.lockers ? jsonData.lockers.length : 0,
                    total: jsonData.total || 0
                });
            } catch (e) {
                console.log('📝 原始响应:', data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (err) => {
        console.error('❌ 寄存点分布接口失败:', err.message);
    });
    
    req.on('timeout', () => {
        console.error('❌ 寄存点分布接口超时');
        req.destroy();
    });
    
    req.write(postData);
    req.end();
}

// 测试附近搜索接口
function testNearbySearch() {
    console.log('\n🔍 测试附近搜索接口...');
    
    const params = new URLSearchParams({
        city_name: '郑州',
        keyword: '火车站',
        page: '1',
        page_size: '10'
    });
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: `/api/nearby/city/search?${params}`,
        method: 'GET',
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        console.log(`✅ 附近搜索接口响应: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📊 搜索结果:', {
                    results: jsonData.results ? jsonData.results.length : 0,
                    keyword: '火车站'
                });
            } catch (e) {
                console.log('📝 原始响应:', data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (err) => {
        console.error('❌ 附近搜索接口失败:', err.message);
    });
    
    req.on('timeout', () => {
        console.error('❌ 附近搜索接口超时');
        req.destroy();
    });
    
    req.end();
}

// 测试城市列表接口
function testCitiesList() {
    console.log('\n🏙️ 测试城市列表接口...');
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/api/cities',
        method: 'GET',
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        console.log(`✅ 城市列表接口响应: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📊 城市数据:', {
                    cities: jsonData.cities ? jsonData.cities.length : 0
                });
            } catch (e) {
                console.log('📝 原始响应:', data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (err) => {
        console.error('❌ 城市列表接口失败:', err.message);
    });
    
    req.on('timeout', () => {
        console.error('❌ 城市列表接口超时');
        req.destroy();
    });
    
    req.end();
}

// 主函数
function main() {
    console.log('🚀 开始检查后端服务连接...');
    console.log(`🔗 目标地址: ${API_BASE_URL}`);
    console.log('=' .repeat(50));
    
    checkBackendService();
}

// 运行检查
main();