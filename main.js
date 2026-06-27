function scrollToSection() {
  document.getElementById('wordcloud').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('load', function() {
  initScrollReveal();
  initProgressBar();
  initCountUp();
  
  if (typeof echarts !== 'undefined') {
    initCharts();
  } else {
    console.warn('ECharts not loaded, retrying...');
    setTimeout(function() {
      if (typeof echarts !== 'undefined') {
        initCharts();
      }
    }, 1000);
  }
});

// 滚动显示动画
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  elements.forEach(function(el) {
    observer.observe(el);
  });
}

// 顶部进度条
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  }
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// 数字计数动画
function initCountUp() {
  const countElements = document.querySelectorAll('.count-up');
  
  const observerOptions = {
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = target * easeOutQuart;
          
          el.textContent = current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, observerOptions);
  
  countElements.forEach(function(el) {
    observer.observe(el);
  });
}

// 获取响应式配置
function getResponsiveConfig() {
  const isMobile = window.innerWidth < 768;
  const isSmallMobile = window.innerWidth < 480;
  
  return {
    grid: {
      left: isSmallMobile ? '8%' : isMobile ? '5%' : '3%',
      right: isSmallMobile ? '8%' : isMobile ? '5%' : '4%',
      bottom: isSmallMobile ? '20%' : isMobile ? '15%' : '8%',
      top: isSmallMobile ? '18%' : isMobile ? '15%' : '10%',
      containLabel: true
    },
    axisLabel: {
      color: '#888',
      fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
      interval: 'auto',
      rotate: isMobile ? 45 : 0
    },
    legend: {
      textStyle: {
        color: '#888',
        fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12
      },
      top: isMobile ? 'bottom' : 'top',
      orient: isMobile ? 'horizontal' : 'horizontal'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: '#333',
      textStyle: {
        color: '#ccc',
        fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12
      },
      confine: true
    }
  };
}

// 初始化图表
function initCharts() {
  const chartContainers = [
    { id: 'comparisonChart', init: initComparisonChart, initialized: false },
    { id: 'populationChart', init: initPopulationChart, initialized: false },
    { id: 'housingChart', init: initHousingChart, initialized: false },
    { id: 'industryChart', init: initIndustryChart, initialized: false },
    { id: 'jingjinjiChart', init: initJingjinjiChart, initialized: false }
  ];
  
  function tryInitChart(chartConfig) {
    if (chartConfig.initialized) return;
    if (typeof echarts === 'undefined') {
      setTimeout(function() {
        tryInitChart(chartConfig);
      }, 200);
      return;
    }
    chartConfig.init();
    chartConfig.initialized = true;
  }
  
  const observerOptions = {
    threshold: 0.2
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const chartId = entry.target.id;
        const chartConfig = chartContainers.find(function(c) {
          return c.id === chartId;
        });
        if (chartConfig && !chartConfig.initialized) {
          tryInitChart(chartConfig);
          observer.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);
  
  chartContainers.forEach(function(chart) {
    const el = document.getElementById(chart.id);
    if (el) {
      observer.observe(el);
    }
  });
  
  // 响应式resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      chartContainers.forEach(function(chart) {
        const el = document.getElementById(chart.id);
        if (el && chart.initialized) {
          try {
            const chartInstance = echarts.getInstanceByDom(el);
            if (chartInstance) {
              chartInstance.resize();
            }
          } catch(e) {
            console.warn('Chart resize failed:', e);
          }
        }
      });
    }, 200);
  });
}

// 词云图表
function initWordCloudChart() {
  const chartDom = document.getElementById('wordCloudChart');
  const myChart = echarts.init(chartDom, 'dark');
  
  const words = [
    { name: '唐山', value: 100, textStyle: { color: '#d4a574' } },
    { name: '地震', value: 95, textStyle: { color: '#8b2942' } },
    { name: '24万', value: 90, textStyle: { color: '#8b2942' } },
    { name: '1976', value: 85, textStyle: { color: '#d4a574' } },
    { name: '废墟', value: 82, textStyle: { color: '#8b2942' } },
    { name: '重生', value: 80, textStyle: { color: '#d4a574' } },
    { name: '7.8级', value: 75, textStyle: { color: '#a83c5a' } },
    { name: '重建', value: 73, textStyle: { color: '#d4a574' } },
    { name: '凌晨3:42', value: 70, textStyle: { color: '#8b2942' } },
    { name: 'New Life', value: 68, textStyle: { color: '#4ade80', rotate: 45 } },
    { name: '铭记', value: 65, textStyle: { color: '#d4a574' } },
    { name: 'Remember', value: 62, textStyle: { color: '#60a5fa', rotate: -15 } },
    { name: '钢铁', value: 60, textStyle: { color: '#9ca3af' } },
    { name: '涅槃', value: 58, textStyle: { color: '#d4a574' } },
    { name: 'Healing', value: 55, textStyle: { color: '#4ade80', rotate: 30 } },
    { name: '苦难', value: 52, textStyle: { color: '#8b2942' } },
    { name: '希望', value: 50, textStyle: { color: '#d4a574' } },
    { name: '重生', value: 48, textStyle: { color: '#4ade80' } },
    { name: '奋斗', value: 45, textStyle: { color: '#d4a574' } },
    { name: '23秒', value: 42, textStyle: { color: '#8b2942' } },
    { name: '废墟之上', value: 40, textStyle: { color: '#d4a574' } },
    { name: '城市', value: 38, textStyle: { color: '#9ca3af' } },
    { name: 'China', value: 35, textStyle: { color: '#60a5fa', rotate: -45 } },
    { name: '坚强', value: 33, textStyle: { color: '#d4a574' } },
    { name: '精神', value: 30, textStyle: { color: '#9ca3af' } },
    { name: '家园', value: 28, textStyle: { color: '#d4a574' } },
    { name: 'Hope', value: 25, textStyle: { color: '#4ade80', rotate: 15 } },
    { name: '团结', value: 22, textStyle: { color: '#60a5fa' } },
    { name: '重建', value: 20, textStyle: { color: '#d4a574' } },
    { name: '记忆', value: 18, textStyle: { color: '#9ca3af' } },
    { name: '历史', value: 15, textStyle: { color: '#9ca3af' } },
    { name: '伤痛', value: 12, textStyle: { color: '#8b2942' } },
    { name: '坚强', value: 10, textStyle: { color: '#4ade80' } }
  ];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: 'rgba(26, 26, 26, 0.9)',
      borderColor: '#333',
      textStyle: {
        color: '#ccc'
      },
      formatter: function(params) {
        return params.name + ': ' + params.value;
      }
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [14, 60],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'Noto Sans SC, sans-serif',
        fontWeight: 'bold'
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#d4a574'
        }
      },
      data: words
    }]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// 地震对比图表
function initComparisonChart() {
  const chartDom = document.getElementById('comparisonChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: responsive.tooltip,
    legend: {
      data: ['死亡人数', '震级'],
      ...responsive.legend
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: ['唐山1976', '汶川2008', '玉树2010', '芦山2013', '九寨沟2017'],
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: {
        ...responsive.axisLabel,
        margin: 12
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '死亡人数',
        nameTextStyle: {
          color: '#888'
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#888'
        },
        splitLine: {
          lineStyle: {
            color: '#222'
          }
        }
      },
      {
        type: 'value',
        name: '震级',
        nameTextStyle: {
          color: '#888'
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#888'
        },
        splitLine: {
          show: false
        },
        max: 10
      }
    ],
    series: [
      {
        name: '死亡人数',
        type: 'bar',
        data: [242769, 69227, 2698, 196, 25],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b2942' },
            { offset: 1, color: '#5c1a2d' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#a83c5a',
          fontSize: 12,
          formatter: function(params) {
            return params.value.toLocaleString();
          }
        }
      },
      {
        name: '震级',
        type: 'line',
        yAxisIndex: 1,
        data: [7.8, 8.0, 7.1, 7.0, 7.0],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#d4a574',
          width: 3
        },
        itemStyle: {
          color: '#d4a574',
          borderColor: '#1a1a1a',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'right',
          color: '#d4a574',
          fontSize: 12
        }
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// GDP增长图表
function initGDPChart() {
  const chartDom = document.getElementById('gdpChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const years = ['1976', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025'];
  const gdpData = [25, 32, 58, 105, 240, 480, 880, 1650, 2760, 3520, 4200];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...responsive.tooltip,
      formatter: function(params) {
        return params[0].name + '年<br/>GDP: ' + params[0].value + ' 亿元';
      }
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: responsive.axisLabel
    },
    yAxis: {
      type: 'value',
      name: 'GDP（亿元）',
      nameTextStyle: {
        color: '#888'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#888'
      },
      splitLine: {
        lineStyle: {
          color: '#222'
        }
      }
    },
    series: [
      {
        name: 'GDP',
        type: 'bar',
        data: gdpData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#d4a574' },
            { offset: 1, color: '#8b2942' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e8c9a8' },
              { offset: 1, color: '#a83c5a' }
            ])
          }
        },
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      },
      {
        name: '增长趋势',
        type: 'line',
        data: gdpData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#d4a574',
          width: 2
        },
        itemStyle: {
          color: '#d4a574',
          borderColor: '#0d0d0d',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212, 165, 116, 0.3)' },
            { offset: 1, color: 'rgba(212, 165, 116, 0)' }
          ])
        },
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// 人口变化图表
function initPopulationChart() {
  const chartDom = document.getElementById('populationChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const years = ['1976', '1985', '1995', '2005', '2015', '2025'];
  const populationData = [90, 115, 140, 160, 175, 185];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...responsive.tooltip,
      formatter: function(params) {
        return params[0].name + '年<br/>人口: ' + params[0].value + ' 万人';
      }
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: responsive.axisLabel
    },
    yAxis: {
      type: 'value',
      name: '万人',
      nameTextStyle: {
        color: '#888'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#888'
      },
      splitLine: {
        lineStyle: {
          color: '#222'
        }
      }
    },
    series: [
      {
        name: '人口',
        type: 'line',
        data: populationData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          color: '#d4a574',
          width: 3
        },
        itemStyle: {
          color: '#d4a574',
          borderColor: '#1a1a1a',
          borderWidth: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212, 165, 116, 0.4)' },
            { offset: 1, color: 'rgba(212, 165, 116, 0)' }
          ])
        },
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// 住房面积图表
function initHousingChart() {
  const chartDom = document.getElementById('housingChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const years = ['1976', '1985', '1995', '2005', '2015', '2025'];
  const housingData = [4.5, 8, 15, 25, 35, 42];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...responsive.tooltip,
      formatter: function(params) {
        return params[0].name + '年<br/>人均住房面积: ' + params[0].value + ' ㎡';
      }
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: responsive.axisLabel
    },
    yAxis: {
      type: 'value',
      name: '㎡',
      nameTextStyle: {
        color: '#888'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#888'
      },
      splitLine: {
        lineStyle: {
          color: '#222'
        }
      }
    },
    series: [
      {
        name: '住房面积',
        type: 'bar',
        data: housingData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#d4a574' },
            { offset: 1, color: '#8b6914' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e8c9a8' },
              { offset: 1, color: '#a88520' }
            ])
          }
        },
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// 产业结构图表
function initIndustryChart() {
  const chartDom = document.getElementById('industryChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const years = ['1976', '1990', '2000', '2010', '2020', '2025'];
  const primary = [32, 25, 18, 10, 7, 5];
  const secondary = [58, 55, 52, 55, 52, 48];
  const tertiary = [10, 20, 30, 35, 41, 47];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...responsive.tooltip,
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['第一产业', '第二产业', '第三产业'],
      ...responsive.legend
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: responsive.axisLabel
    },
    yAxis: {
      type: 'value',
      name: '占比(%)',
      nameTextStyle: {
        color: '#888'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#888'
      },
      splitLine: {
        lineStyle: {
          color: '#222'
        }
      }
    },
    series: [
      {
        name: '第一产业',
        type: 'bar',
        stack: 'total',
        data: primary,
        itemStyle: {
          color: '#6b8e4e'
        },
        emphasis: {
          itemStyle: {
            color: '#8ba66a'
          }
        },
        animationDuration: 2000
      },
      {
        name: '第二产业',
        type: 'bar',
        stack: 'total',
        data: secondary,
        itemStyle: {
          color: '#8b2942'
        },
        emphasis: {
          itemStyle: {
            color: '#a83c5a'
          }
        },
        animationDuration: 2000
      },
      {
        name: '第三产业',
        type: 'bar',
        stack: 'total',
        data: tertiary,
        itemStyle: {
          color: '#d4a574'
        },
        emphasis: {
          itemStyle: {
            color: '#e8c9a8'
          }
        },
        animationDuration: 2000
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// 京津冀产业承接图表
function initJingjinjiChart() {
  const chartDom = document.getElementById('jingjinjiChart');
  const myChart = echarts.init(chartDom, 'dark');
  const responsive = getResponsiveConfig();
  
  const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const investmentData = [68, 79, 92, 85, 81, 75, 89, 96, 124, 132, 130, 138];
  const projectCount = [52, 68, 85, 78, 72, 65, 82, 95, 128, 145, 142, 155];
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: responsive.tooltip,
    legend: {
      data: ['承接投资额(亿元)', '落地项目(个)'],
      ...responsive.legend
    },
    grid: responsive.grid,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: '#444'
        }
      },
      axisLabel: responsive.axisLabel
    },
    yAxis: [
      {
        type: 'value',
        name: '投资额(亿元)',
        nameTextStyle: {
          color: '#888'
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#888'
        },
        splitLine: {
          lineStyle: {
            color: '#222'
          }
        }
      },
      {
        type: 'value',
        name: '项目数(个)',
        nameTextStyle: {
          color: '#888'
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#888'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '承接投资额(亿元)',
        type: 'bar',
        data: investmentData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#d4a574' },
            { offset: 1, color: '#8b6914' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        animationDuration: 2000
      },
      {
        name: '落地项目(个)',
        type: 'line',
        yAxisIndex: 1,
        data: projectCount,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#a83c5a',
          width: 2
        },
        itemStyle: {
          color: '#a83c5a',
          borderColor: '#0d0d0d',
          borderWidth: 2
        },
        animationDuration: 2000
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}
