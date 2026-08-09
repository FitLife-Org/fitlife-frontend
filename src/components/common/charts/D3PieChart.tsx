import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ChartDataDto } from '../../../types/dashboard.type';

interface D3PieChartProps {
  data: ChartDataDto[];
  height?: number;
  colors?: string[];
  donut?: boolean;
}

export default function D3PieChart({ 
  data, 
  height = 300, 
  colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'],
  donut = true
}: D3PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0 || width === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = donut ? radius * 0.6 : 0; // 0 for pie chart, >0 for donut

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Setup color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(colors);

    // Setup pie and arc generators
    const pie = d3.pie<ChartDataDto>()
      .value(d => Number(d.value))
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<ChartDataDto>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);
      
    // Hover arc generator (slightly larger)
    const arcHover = d3.arc<d3.PieArcDatum<ChartDataDto>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 5);

    // Tooltip setup
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('box-shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');

    const total = d3.sum(data, d => Number(d.value));

    // Draw slices
    const slices = g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', '2px')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr('d', arcHover as any);
          
        const percent = ((Number(d.data.value) / total) * 100).toFixed(1);
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>${d.data.label}</strong><br/>Giá trị: ${d.data.value}<br/>Tỷ lệ: ${percent}%`);
      })
      .on('mousemove', function (event) {
        const [xPos, yPos] = d3.pointer(event, containerRef.current);
        tooltip
          .style('top', (yPos - 50) + 'px')
          .style('left', (xPos + 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr('d', arc as any);
        tooltip.style('visibility', 'hidden');
      });

    // Animation
    slices.transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
          return arc(i(t)) as string;
        };
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, colors, donut]);

  return (
    <div ref={containerRef} className="w-full relative flex items-center justify-center">
      <svg ref={svgRef}></svg>
      {/* Legend below chart */}
      <div className="absolute bottom-0 w-full flex flex-wrap justify-center gap-4 mt-4 pointer-events-none">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
