import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ChartDataDto } from '../../../types/dashboard.type';
import { formatCurrency } from '../../../utils/formatCurrency';

interface D3BarChartProps {
  data: ChartDataDto[];
  height?: number;
  yAxisFormatter?: (value: number) => string;
  color?: string;
}

export default function D3BarChart({ 
  data, 
  height = 300, 
  yAxisFormatter = (val) => val.toString(),
  color = '#10b981' // emerald-500
}: D3BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Resize observer to make chart responsive
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

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3);

    const maxY = d3.max(data, d => Number(d.value)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1]) // Add 10% padding on top
      .range([innerHeight, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => '').ticks(5))
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '4,4');

    g.selectAll('.grid-lines path').remove(); // Remove domain line

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));
    
    xAxis.select('.domain').remove();
    xAxis.selectAll('text').attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '500');

    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => yAxisFormatter(Number(d))));

    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').remove();
    yAxis.selectAll('text').attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '500');

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

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label)!)
      .attr('width', x.bandwidth())
      .attr('y', innerHeight) // Start from bottom for animation
      .attr('height', 0)
      .attr('fill', color)
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>${d.label}</strong><br/>${yAxisFormatter === formatCurrency ? formatCurrency(Number(d.value)) : d.value}`);
      })
      .on('mousemove', function (event) {
        // Position relative to the container
        const [xPos, yPos] = d3.pointer(event, containerRef.current);
        tooltip
          .style('top', (yPos - 40) + 'px')
          .style('left', (xPos + 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
        tooltip.style('visibility', 'hidden');
      })
      // Animation
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .delay((_, i) => i * 50)
      .attr('y', d => y(Number(d.value)))
      .attr('height', d => innerHeight - y(Number(d.value)));

    // Cleanup tooltip on unmount or re-render
    return () => {
      tooltip.remove();
    };

  }, [data, width, height, yAxisFormatter, color]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef}></svg>
    </div>
  );
}
